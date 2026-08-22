"use server"

import { prisma } from "@/lib/prisma"
import { getWorkspaceContext, safeError } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const appointmentSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  propertyId: z.string().optional(),
  date: z.string().min(1, "Date is required").refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date and time"),
  duration: z.number().int().min(15).max(480).default(60),
  notes: z.string().trim().max(4_000).optional(),
})

export async function getAppointments(filters?: {
  status?: string
  leadId?: string
  propertyId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { appointments: [], total: 0, error: "Unauthorized" }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {
      organizationId: context.organizationId,
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status
    }

    if (filters?.leadId) {
      where.leadId = filters.leadId
    }

    if (filters?.propertyId) {
      where.propertyId = filters.propertyId
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {}
      if (filters?.startDate) {
        where.date.gte = new Date(filters.startDate)
      }
      if (filters?.endDate) {
        where.date.lte = new Date(filters.endDate)
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          lead: {
            select: { id: true, name: true, email: true, phone: true },
          },
          property: {
            select: { id: true, name: true, location: true, price: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: "asc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ])

    return { appointments, total, page, limit }
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return { appointments: [], total: 0, error: "Failed to fetch appointments" }
  }
}

export async function getAppointmentById(id: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { appointment: null, error: "Unauthorized" }
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      include: {
        lead: true,
        property: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!appointment) {
      return { appointment: null, error: "Appointment not found" }
    }

    return { appointment }
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return { appointment: null, error: "Failed to fetch appointment" }
  }
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { appointment: null, error: "Unauthorized" }
    }

    const validated = appointmentSchema.parse(data)

    // Verify lead belongs to organization
    const lead = await prisma.lead.findFirst({
      where: {
        id: validated.leadId,
        organizationId: context.organizationId,
      },
    })

    if (!lead) {
      return { appointment: null, error: "Lead not found" }
    }

    // Verify property if provided
    if (validated.propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          id: validated.propertyId,
          organizationId: context.organizationId,
        },
      })

      if (!property) {
        return { appointment: null, error: "Property not found" }
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        leadId: validated.leadId,
        propertyId: validated.propertyId || null,
        date: new Date(validated.date),
        duration: validated.duration,
        notes: validated.notes || null,
        organizationId: context.organizationId,
        assignedToId: context.userId,
      },
      include: {
        lead: true,
        property: true,
      },
    })

    // Update lead status to APPOINTMENT
    await prisma.lead.update({
      where: { id: validated.leadId },
      data: { status: "APPOINTMENT", lastActivityAt: new Date() },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "APPOINTMENT_CREATED",
        description: `Appointment scheduled with ${lead.name}`,
        organizationId: context.organizationId,
        leadId: lead.id,
        userId: context.userId,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/leads/${lead.id}`)
    return { appointment }
    } catch (error) {
      console.error("Error creating appointment:", error)
    return { appointment: null, error: safeError(error, "Unable to schedule this appointment right now.") }
  }
}

export async function updateAppointment(id: string, data: Partial<z.infer<typeof appointmentSchema>> & { status?: string }) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { appointment: null, error: "Unauthorized" }
    }

    const existing = await prisma.appointment.findFirst({
      where: { id, organizationId: context.organizationId },
    })

    if (!existing) {
      return { appointment: null, error: "Appointment not found" }
    }

    const updateData: any = {}

    if (data.date) updateData.date = new Date(data.date)
    if (data.duration) updateData.duration = data.duration
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.propertyId !== undefined) updateData.propertyId = data.propertyId || null
    if (data.status) updateData.status = data.status

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        lead: true,
        property: true,
      },
    })

    // Create activity log for status change
    if (data.status && data.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: "APPOINTMENT_STATUS_CHANGED",
          description: `Appointment status changed to ${data.status}`,
          organizationId: context.organizationId,
          leadId: existing.leadId,
          userId: context.userId,
        },
      })
      if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(data.status)) {
        await prisma.followUp.updateMany({ where: { leadId: existing.leadId, organizationId: context.organizationId, status: "PENDING" }, data: { status: "FAILED", message: "Stopped because the appointment reached a terminal state." } })
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/leads/${existing.leadId}`)
    return { appointment }
    } catch (error) {
      console.error("Error updating appointment:", error)
    return { appointment: null, error: safeError(error, "Unable to update this appointment right now.") }
  }
}

export async function deleteAppointment(id: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { success: false, error: "Unauthorized" }
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id, organizationId: context.organizationId },
    })

    if (!appointment) {
      return { success: false, error: "Appointment not found" }
    }

    await prisma.appointment.delete({
      where: { id },
    })

    revalidatePath("/dashboard/appointments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return { success: false, error: "Failed to delete appointment" }
  }
}

export async function getUpcomingAppointments(days: number = 7) {
  try {
    const context = await getWorkspaceContext()
    if (!context) {
      return { appointments: [], error: "Unauthorized" }
    }

    const now = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: context.organizationId,
        date: {
          gte: now,
          lte: endDate,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      include: {
        lead: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { date: "asc" },
    })

    return { appointments }
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return { appointments: [], error: "Failed to fetch upcoming appointments" }
  }
}
