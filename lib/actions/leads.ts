"use server"

import { prisma } from "@/lib/prisma"
import { getWorkspaceContext, safeError } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const nullableText = z.string().trim().max(500).optional()
const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  source: z.enum(["WEBSITE", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "GOOGLE_ADS", "PROPERTY_PORTAL", "REFERRAL", "DIRECT_ENQUIRY", "MANUAL", "IMPORT", "OTHER"]).default("MANUAL"),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT", "NEGOTIATION", "WON", "LOST"]).default("NEW"),
  propertyType: nullableText,
  bedrooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(100).optional(),
  budget: z.number().int().min(0).max(2_000_000_000).optional(),
  location: nullableText,
  timeline: nullableText,
  possession: nullableText,
  possessionPreference: nullableText,
  intent: z.enum(["high", "medium", "low", "HIGH", "MEDIUM", "LOW"]).optional(),
  notes: z.string().trim().max(4_000).optional(),
})

type LeadInput = z.infer<typeof leadSchema>

function cleanInput(data: LeadInput) {
  return {
    name: data.name,
    source: data.source,
    status: data.status,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    budget: data.budget ?? null,
    email: data.email || null,
    phone: data.phone || null,
    propertyType: data.propertyType || null,
    location: data.location || null,
    timeline: data.timeline || null,
    possession: data.possession || data.possessionPreference || null,
    possessionPreference: data.possessionPreference || data.possession || null,
    intent: data.intent?.toLowerCase() || null,
    notes: data.notes || null,
  }
}

export async function getLeads(filters?: { status?: string; source?: string; search?: string; page?: number; limit?: number }) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { leads: [], total: 0, error: "Unauthorized" }
    const page = Math.max(1, filters?.page || 1)
    const limit = Math.min(100, Math.max(1, filters?.limit || 10))
    const where = {
      organizationId: context.organizationId,
      ...(filters?.status && filters.status !== "ALL" ? { status: filters.status } : {}),
      ...(filters?.source && filters.source !== "ALL" ? { source: filters.source } : {}),
      ...(filters?.search ? { OR: [
        { name: { contains: filters.search } }, { email: { contains: filters.search } },
        { phone: { contains: filters.search } }, { location: { contains: filters.search } },
      ] } : {}),
    }
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where, include: { assignedTo: { select: { id: true, name: true, email: true } }, leadScores: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { appointments: true, conversations: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.lead.count({ where }),
    ])
    return { leads, total, page, limit }
  } catch (error) {
    console.error("Error fetching leads", error)
    return { leads: [], total: 0, error: "Unable to load leads right now." }
  }
}

export async function getLeadById(id: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { lead: null, error: "Unauthorized" }
    const lead = await prisma.lead.findFirst({ where: { id, organizationId: context.organizationId }, include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      leadScores: { orderBy: { createdAt: "desc" }, take: 5 },
      appointments: { include: { property: true }, orderBy: { date: "desc" }, take: 10 },
      conversations: { include: { messages: { orderBy: { createdAt: "asc" }, take: 100 } }, orderBy: { createdAt: "desc" }, take: 5 },
      followUps: { orderBy: { scheduledAt: "asc" }, take: 20 },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    } })
    return lead ? { lead } : { lead: null, error: "Lead not found" }
  } catch (error) {
    console.error("Error fetching lead", error)
    return { lead: null, error: "Unable to load this lead right now." }
  }
}

export async function createLead(data: LeadInput) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { lead: null, error: "Unauthorized" }
    const validated = leadSchema.parse(data)
    const input = cleanInput(validated)
    const lead = await prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({ data: { ...input, organizationId: context.organizationId, createdById: context.userId, assignedToId: context.userId } })
      await tx.leadScore.create({ data: { leadId: created.id, organizationId: context.organizationId, reasoning: JSON.stringify(["Awaiting conversation signals"]) } })
      let sequence = await tx.followUpSequence.findFirst({ where: { organizationId: context.organizationId, triggerEvent: "NEW_LEAD", isActive: true }, include: { steps: { orderBy: { order: "asc" } } } })
      if (!sequence) {
        sequence = await tx.followUpSequence.create({ data: { organizationId: context.organizationId, name: "New lead follow-up", description: "A conservative three-touch sequence for new property enquiries.", steps: { create: [
          { order: 1, delayHours: 24, channel: "WHATSAPP", message: "Just checking in — would you like me to send you properties matching your requirements?" },
          { order: 2, delayHours: 48, channel: "WHATSAPP", message: "I found a few options that may fit what you’re looking for. Would you like to see them?" },
          { order: 3, delayHours: 96, channel: "WHATSAPP", message: "Would you like to schedule a quick call with one of our property consultants?" },
        ] } }, include: { steps: { orderBy: { order: "asc" } } } })
      }
      if (sequence.steps.length) {
        let scheduledAt = new Date()
        for (const step of sequence.steps) {
          scheduledAt = new Date(scheduledAt.getTime() + step.delayHours * 60 * 60 * 1000)
          await tx.followUp.create({ data: { leadId: created.id, organizationId: context.organizationId, stepId: step.id, scheduledAt, channel: step.channel, message: step.message } })
        }
      }
      await tx.activity.create({ data: { type: "LEAD_CREATED", description: `Lead "${created.name}" was created`, organizationId: context.organizationId, leadId: created.id, userId: context.userId } })
      return created
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    return { lead }
  } catch (error) {
    console.error("Error creating lead", error)
    return { lead: null, error: safeError(error, "Unable to create this lead. Please check the details and try again.") }
  }
}

export async function updateLead(id: string, data: Partial<LeadInput>) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { lead: null, error: "Unauthorized" }
    const validated = leadSchema.partial().parse(data)
    const existing = await prisma.lead.findFirst({ where: { id, organizationId: context.organizationId } })
    if (!existing) return { lead: null, error: "Lead not found" }
    const merged = { ...existing, ...validated } as LeadInput
    const lead = await prisma.lead.update({ where: { id }, data: cleanInput(merged) })
    await prisma.activity.create({ data: { type: validated.status && validated.status !== existing.status ? "LEAD_STATUS_CHANGED" : "LEAD_UPDATED", description: validated.status && validated.status !== existing.status ? `Lead status changed from ${existing.status} to ${validated.status}` : `Lead "${lead.name}" was updated`, organizationId: context.organizationId, leadId: id, userId: context.userId } })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${id}`)
    return { lead }
  } catch (error) {
    console.error("Error updating lead", error)
    return { lead: null, error: safeError(error, "Unable to update this lead right now.") }
  }
}

export async function deleteLead(id: string) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { success: false, error: "Unauthorized" }
    const lead = await prisma.lead.findFirst({ where: { id, organizationId: context.organizationId }, select: { id: true } })
    if (!lead) return { success: false, error: "Lead not found" }
    await prisma.lead.delete({ where: { id } })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    return { success: true }
  } catch (error) {
    console.error("Error deleting lead", error)
    return { success: false, error: "Unable to delete this lead right now." }
  }
}

export async function assignLead(leadId: string, userId: string | null) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { success: false, error: "Unauthorized" }
    const [lead, assignee] = await Promise.all([
      prisma.lead.findFirst({ where: { id: leadId, organizationId: context.organizationId }, select: { id: true } }),
      userId ? prisma.user.findFirst({ where: { id: userId, organizationId: context.organizationId }, select: { id: true } }) : null,
    ])
    if (!lead) return { success: false, error: "Lead not found" }
    if (userId && !assignee) return { success: false, error: "Assignee not found in this workspace" }
    await prisma.lead.update({ where: { id: leadId }, data: { assignedToId: userId } })
    await prisma.activity.create({ data: { type: "LEAD_ASSIGNED", description: userId ? "Lead assigned to a workspace teammate" : "Lead unassigned", organizationId: context.organizationId, leadId, userId: context.userId } })
    revalidatePath("/dashboard/leads")
    return { success: true }
  } catch (error) {
    console.error("Error assigning lead", error)
    return { success: false, error: "Unable to assign this lead right now." }
  }
}
