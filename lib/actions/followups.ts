"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getWorkspaceContext, safeError } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"

const followUpSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  scheduledAt: z.string().min(1, "Date and time are required").refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date and time"),
  channel: z.enum(["WHATSAPP", "EMAIL", "SMS", "CALL", "OTHER"]).default("WHATSAPP"),
  message: z.string().trim().max(4_000).optional(),
  status: z.enum(["PENDING", "COMPLETED", "MISSED", "CANCELLED"]).default("PENDING"),
})

export async function getFollowUps(leadId?: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { followUps: [], error: "Unauthorized" }
    const followUps = await prisma.followUp.findMany({
      where: { organizationId: context.organizationId, ...(leadId ? { leadId } : {}) },
      include: { lead: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { scheduledAt: "asc" },
    })
    return { followUps }
  } catch (error) {
    console.error("Error fetching follow-ups", error)
    return { followUps: [], error: "Unable to load follow-ups right now." }
  }
}

export async function createFollowUp(data: z.infer<typeof followUpSchema>) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { followUp: null, error: "Unauthorized" }
    const validated = followUpSchema.parse(data)
    const lead = await prisma.lead.findFirst({ where: { id: validated.leadId, organizationId: context.organizationId }, select: { id: true, name: true } })
    if (!lead) return { followUp: null, error: "Lead not found" }
    const followUp = await prisma.followUp.create({
      data: { leadId: lead.id, organizationId: context.organizationId, scheduledAt: new Date(validated.scheduledAt), channel: validated.channel, message: validated.message || null, status: validated.status },
      include: { lead: { select: { id: true, name: true, email: true, phone: true } } },
    })
    await prisma.activity.create({ data: { type: "FOLLOW_UP_CREATED", description: `Follow-up scheduled with ${lead.name}`, organizationId: context.organizationId, leadId: lead.id, userId: context.userId } })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/leads/${lead.id}`)
    return { followUp }
  } catch (error) {
    console.error("Error creating follow-up", error)
    return { followUp: null, error: safeError(error, "Unable to create this follow-up right now.") }
  }
}

export async function updateFollowUp(id: string, data: Partial<z.infer<typeof followUpSchema>>) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { followUp: null, error: "Unauthorized" }
    const validated = followUpSchema.partial().parse(data)
    const existing = await prisma.followUp.findFirst({ where: { id, organizationId: context.organizationId } })
    if (!existing) return { followUp: null, error: "Follow-up not found" }
    if (validated.leadId) {
      const lead = await prisma.lead.findFirst({ where: { id: validated.leadId, organizationId: context.organizationId }, select: { id: true } })
      if (!lead) return { followUp: null, error: "Lead not found" }
    }
    const followUp = await prisma.followUp.update({
      where: { id },
      data: { ...validated, scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : undefined, message: validated.message === undefined ? undefined : validated.message || null },
      include: { lead: { select: { id: true, name: true, email: true, phone: true } } },
    })
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/leads/${existing.leadId}`)
    return { followUp }
  } catch (error) {
    console.error("Error updating follow-up", error)
    return { followUp: null, error: safeError(error, "Unable to update this follow-up right now.") }
  }
}

export async function deleteFollowUp(id: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { success: false, error: "Unauthorized" }
    const existing = await prisma.followUp.findFirst({ where: { id, organizationId: context.organizationId }, select: { id: true, leadId: true } })
    if (!existing) return { success: false, error: "Follow-up not found" }
    await prisma.followUp.update({ where: { id }, data: { status: "CANCELLED" } })
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/leads/${existing.leadId}`)
    return { success: true }
  } catch (error) {
    console.error("Error cancelling follow-up", error)
    return { success: false, error: "Unable to cancel this follow-up right now." }
  }
}
