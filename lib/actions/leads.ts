"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.enum(["WEBSITE", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "GOOGLE_ADS", "MANUAL", "IMPORT", "OTHER"]).default("MANUAL"),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "HOT", "WARM", "COLD", "APPOINTMENT", "CONVERTED", "LOST"]).default("NEW"),
  propertyType: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  budget: z.number().optional(),
  location: z.string().optional(),
  timeline: z.string().optional(),
  possession: z.string().optional(),
  intent: z.string().optional(),
  notes: z.string().optional(),
})

export async function getLeads(filters?: {
  status?: string
  source?: string
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { leads: [], total: 0, error: "Unauthorized" }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {
      organizationId: session.user.organizationId,
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status
    }

    if (filters?.source && filters.source !== "ALL") {
      where.source = filters.source
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          leadScores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: { appointments: true, conversations: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return { leads, total, page, limit }
  } catch (error) {
    console.error("Error fetching leads:", error)
    return { leads: [], total: 0, error: "Failed to fetch leads" }
  }
}

export async function getLeadById(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { lead: null, error: "Unauthorized" }
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        leadScores: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        appointments: {
          include: {
            property: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    if (!lead) {
      return { lead: null, error: "Lead not found" }
    }

    return { lead }
  } catch (error) {
    console.error("Error fetching lead:", error)
    return { lead: null, error: "Failed to fetch lead" }
  }
}

export async function createLead(data: z.infer<typeof leadSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { lead: null, error: "Unauthorized" }
    }

    const validated = leadSchema.parse(data)

    const lead = await prisma.lead.create({
      data: {
        ...validated,
        email: validated.email || null,
        phone: validated.phone || null,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "LEAD_CREATED",
        description: `Lead "${lead.name}" was created`,
        organizationId: session.user.organizationId,
        leadId: lead.id,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/leads")
    return { lead }
  } catch (error) {
    console.error("Error creating lead:", error)
    return { lead: null, error: "Failed to create lead" }
  }
}

export async function updateLead(id: string, data: Partial<z.infer<typeof leadSchema>>) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { lead: null, error: "Unauthorized" }
    }

    const existingLead = await prisma.lead.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!existingLead) {
      return { lead: null, error: "Lead not found" }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    // Create activity log for status change
    if (data.status && data.status !== existingLead.status) {
      await prisma.activity.create({
        data: {
          type: "LEAD_STATUS_CHANGED",
          description: `Lead status changed from ${existingLead.status} to ${data.status}`,
          organizationId: session.user.organizationId,
          leadId: lead.id,
          userId: session.user.id,
        },
      })
    }

    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${id}`)
    return { lead }
  } catch (error) {
    console.error("Error updating lead:", error)
    return { lead: null, error: "Failed to update lead" }
  }
}

export async function deleteLead(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { success: false, error: "Unauthorized" }
    }

    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!lead) {
      return { success: false, error: "Lead not found" }
    }

    await prisma.lead.delete({
      where: { id },
    })

    revalidatePath("/dashboard/leads")
    return { success: true }
  } catch (error) {
    console.error("Error deleting lead:", error)
    return { success: false, error: "Failed to delete lead" }
  }
}

export async function assignLead(leadId: string, userId: string | null) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { success: false, error: "Unauthorized" }
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: session.user.organizationId },
    })

    if (!lead) {
      return { success: false, error: "Lead not found" }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { assignedToId: userId },
    })

    await prisma.activity.create({
      data: {
        type: "LEAD_ASSIGNED",
        description: userId ? `Lead assigned to user` : `Lead unassigned`,
        organizationId: session.user.organizationId,
        leadId,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/leads")
    return { success: true }
  } catch (error) {
    console.error("Error assigning lead:", error)
    return { success: false, error: "Failed to assign lead" }
  }
}