"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getWorkspaceContext } from "@/lib/auth-context"
import { processLeadMessage } from "@/lib/ai/lead-engine"
import { prisma } from "@/lib/prisma"

const leadSelect = {
  id: true, name: true, email: true, phone: true, status: true, score: true, classification: true,
  propertyType: true, bedrooms: true, bathrooms: true, budget: true, location: true, timeline: true,
  possession: true, possessionPreference: true, intent: true, notes: true,
  conversations: { orderBy: { updatedAt: "desc" as const }, take: 1, include: { messages: { orderBy: { createdAt: "desc" as const }, take: 10 } } },
  followUps: { orderBy: { scheduledAt: "asc" as const }, take: 10, select: { id: true, scheduledAt: true, status: true, channel: true, message: true } },
  leadScores: { orderBy: { createdAt: "desc" as const }, take: 1, select: { score: true, classification: true, reasoning: true } },
} as const

async function workspaceLead(leadId: string) {
  const context = await getWorkspaceContext()
  if (!context) return { context: null, lead: null }
  const lead = await prisma.lead.findFirst({ where: { id: leadId, organizationId: context.organizationId }, select: leadSelect })
  return { context, lead }
}

function facts(lead: NonNullable<Awaited<ReturnType<typeof workspaceLead>>["lead"]>) {
  return [
    `Name: ${lead.name}`,
    `Email: ${lead.email || "not provided"}`,
    `Phone: ${lead.phone || "not provided"}`,
    `Status: ${lead.status}`,
    `Current score: ${lead.score}/100 (${lead.classification})`,
    `Property type: ${lead.propertyType || "not captured"}`,
    `Bedrooms: ${lead.bedrooms ?? "not captured"}`,
    `Budget: ${lead.budget ? `₹${lead.budget.toLocaleString("en-IN")}` : "not captured"}`,
    `Location: ${lead.location || "not captured"}`,
    `Timeline: ${lead.timeline || "not captured"}`,
    `Possession: ${lead.possessionPreference || lead.possession || "not captured"}`,
    `Intent: ${lead.intent || "not captured"}`,
    `Notes: ${lead.notes || "none"}`,
    `Recent conversation: ${lead.conversations[0]?.messages.slice().reverse().map((message) => `${message.role}: ${message.content}`).join(" | ") || "none"}`,
  ].join("\n")
}

function recommendation(lead: { score: number; propertyType: string | null; location: string | null; budget: number | null; timeline: string | null }, matches: number) {
  if (matches) return "Send the matched properties and propose a viewing time."
  if (!lead.location || !lead.budget || !lead.propertyType) return "Confirm the missing property requirements before recommending inventory."
  if (lead.timeline) return "Follow up with suitable inventory and ask for a preferred appointment time."
  return "Confirm the buying timeline and next preferred contact time."
}

async function matchesForLead(organizationId: string, lead: { location: string | null; budget: number | null; propertyType: string | null; bedrooms: number | null }) {
  const properties = await prisma.property.findMany({ where: { organizationId, status: "AVAILABLE", availableUnits: { gt: 0 } }, select: { id: true, name: true, type: true, location: true, price: true, bedrooms: true, bathrooms: true, possessionStatus: true, description: true, availableUnits: true }, take: 100 })
  const location = lead.location?.toLowerCase()
  const type = lead.propertyType?.toLowerCase()
  return properties.map((property) => {
    let relevance = 0
    if (location && `${property.location} ${property.name}`.toLowerCase().includes(location)) relevance += 40
    if (lead.budget && property.price <= lead.budget) relevance += 25
    if (lead.bedrooms && (property.bedrooms || 0) >= lead.bedrooms) relevance += 20
    if (type && (property.type.toLowerCase().includes(type) || type === "apartment" && property.type === "Apartment")) relevance += 15
    return { ...property, relevance }
  }).filter((property) => (!lead.budget || property.price <= lead.budget) && (!lead.bedrooms || (property.bedrooms || 0) >= lead.bedrooms) && (!type || property.type.toLowerCase().includes(type) || type === "apartment" && property.type === "Apartment")).sort((a, b) => b.relevance - a.relevance).slice(0, 8)
}

export async function getAssistantLeads() {
  const context = await getWorkspaceContext()
  if (!context) return { leads: [], error: "Unauthorized" }
  const leads = await prisma.lead.findMany({ where: { organizationId: context.organizationId }, select: { id: true, name: true, email: true, phone: true, status: true, score: true, classification: true, propertyType: true, bedrooms: true, budget: true, location: true, timeline: true }, orderBy: { updatedAt: "desc" } })
  return { leads }
}

export async function getAssistantLead(leadId: string) {
  const result = await workspaceLead(leadId)
  if (!result.context) return { lead: null, error: "Unauthorized" }
  if (!result.lead) return { lead: null, error: "Lead not found in this workspace" }
  return { lead: result.lead }
}

export async function analyzeLead(leadId: string) {
  const result = await workspaceLead(leadId)
  if (!result.context) return { error: "Unauthorized" }
  if (!result.lead) return { error: "Lead not found in this workspace" }
  const response = await processLeadMessage(result.context, leadId, `Analyze this real estate lead using only these workspace facts. Extract intent, urgency, propertyType, location, budget, bedrooms, timeline, buying or selling intent, qualification summary, and recommended next action.\n${facts(result.lead)}`)
  if (!response.ok) return { error: response.error }
  const urgency = response.extracted.timeline || response.extracted.intent === "HIGH" ? "High" : response.extracted.intent === "MEDIUM" ? "Medium" : "Unclear"
  const buyingSellingIntent = response.extracted.intent ? "Buying" : "Not yet determined"
  const qualificationSummary = response.score.score >= 60 ? "This lead has enough captured intent or requirements to move toward a direct sales conversation." : "More requirements are needed before this lead is fully qualified."
  const recommendedNextAction = recommendation({ ...result.lead, score: response.score.score, propertyType: response.extracted.propertyType, location: response.extracted.location, budget: response.extracted.budget, timeline: response.extracted.timeline }, response.matches.length)
  const analysis = { ...response.extracted, urgency, buyingSellingIntent, qualificationSummary, recommendedNextAction }
  await prisma.$transaction([
    prisma.conversation.update({ where: { id: response.conversationId }, data: { extractedData: JSON.stringify(analysis) } }),
    prisma.activity.create({ data: { type: "AI_LEAD_ANALYZED", description: `AI analyzed ${result.lead.name}`, metadata: JSON.stringify(analysis), organizationId: result.context.organizationId, leadId, userId: result.context.userId } }),
  ])
  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath("/dashboard/scoring")
  return { analysis, matches: response.matches, score: response.score, assistantMessage: response.assistantMessage, aiUnavailable: response.aiUnavailable }
}

export async function generateSalesReply(leadId: string) {
  const result = await workspaceLead(leadId)
  if (!result.context) return { error: "Unauthorized" }
  if (!result.lead) return { error: "Lead not found in this workspace" }
  const matches = await matchesForLead(result.context.organizationId, result.lead)
  const key = process.env.OPENAI_API_KEY
  let reply = `Hi ${result.lead.name}, based on your requirement${result.lead.bedrooms ? ` for a ${result.lead.bedrooms} BHK` : ""}${result.lead.location ? ` in ${result.lead.location}` : ""}${result.lead.budget ? ` around ₹${(result.lead.budget / 10000000).toFixed(1)} Cr` : ""}, I’ve shortlisted ${matches.length ? "a few properties that match your preferences" : "the information currently available"}. I can also arrange a property visit at a convenient time.`
  if (key) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.3, messages: [{ role: "system", content: "Write one concise, professional real-estate WhatsApp/email reply. Use only the supplied lead facts and say when details are missing. Never invent property facts." }, { role: "user", content: JSON.stringify({ lead: result.lead, matches }) }] }), signal: AbortSignal.timeout(8_000) })
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      reply = payload.choices?.[0]?.message?.content?.trim() || reply
    } catch { /* The deterministic reply remains usable when AI is unavailable. */ }
  }
  await prisma.activity.create({ data: { type: "AI_SALES_REPLY_GENERATED", description: `Sales reply generated for ${result.lead.name}`, metadata: JSON.stringify({ leadId, matches: matches.map((item) => item.id) }), organizationId: result.context.organizationId, leadId, userId: result.context.userId } })
  return { reply, matches }
}

export async function findMatchingProperties(leadId: string) {
  const result = await workspaceLead(leadId)
  if (!result.context) return { properties: [], error: "Unauthorized" }
  if (!result.lead) return { properties: [], error: "Lead not found in this workspace" }
  return { properties: await matchesForLead(result.context.organizationId, result.lead) }
}

const followUpInput = z.object({ leadId: z.string().min(1), scheduledAt: z.string().min(1), channel: z.enum(["WHATSAPP", "EMAIL", "SMS", "CALL", "OTHER"]), message: z.string().trim().max(4_000).optional() })
export async function createAssistantFollowUp(input: z.infer<typeof followUpInput>) {
  const context = await getWorkspaceContext()
  if (!context) return { error: "Unauthorized" }
  const value = followUpInput.safeParse(input)
  if (!value.success || Number.isNaN(new Date(value.data.scheduledAt).getTime())) return { error: "Enter a valid follow-up date and time." }
  const lead = await prisma.lead.findFirst({ where: { id: value.data.leadId, organizationId: context.organizationId }, select: { id: true, name: true } })
  if (!lead) return { error: "Lead not found in this workspace" }
  const followUp = await prisma.followUp.create({ data: { leadId: lead.id, organizationId: context.organizationId, scheduledAt: new Date(value.data.scheduledAt), channel: value.data.channel, message: value.data.message || null }, include: { lead: { select: { id: true, name: true } } } })
  await prisma.activity.create({ data: { type: "FOLLOW_UP_CREATED", description: `Follow-up scheduled with ${lead.name}`, organizationId: context.organizationId, leadId: lead.id, userId: context.userId } })
  revalidatePath("/dashboard/follow-ups")
  return { followUp }
}

const appointmentInput = z.object({ leadId: z.string().min(1), propertyId: z.string().optional(), date: z.string().min(1), duration: z.number().int().min(15).max(480), notes: z.string().trim().max(4_000).optional() })
export async function createAssistantAppointment(input: z.infer<typeof appointmentInput>) {
  const context = await getWorkspaceContext()
  if (!context) return { error: "Unauthorized" }
  const value = appointmentInput.safeParse(input)
  if (!value.success || Number.isNaN(new Date(value.data.date).getTime())) return { error: "Enter a valid appointment date and time." }
  const lead = await prisma.lead.findFirst({ where: { id: value.data.leadId, organizationId: context.organizationId }, select: { id: true, name: true } })
  if (!lead) return { error: "Lead not found in this workspace" }
  if (value.data.propertyId) {
    const property = await prisma.property.findFirst({ where: { id: value.data.propertyId, organizationId: context.organizationId }, select: { id: true } })
    if (!property) return { error: "Property not found in this workspace" }
  }
  const appointment = await prisma.appointment.create({ data: { leadId: lead.id, propertyId: value.data.propertyId || null, date: new Date(value.data.date), duration: value.data.duration, notes: value.data.notes || null, organizationId: context.organizationId, assignedToId: context.userId }, include: { lead: { select: { id: true, name: true } }, property: { select: { id: true, name: true } } } })
  await prisma.lead.update({ where: { id: lead.id }, data: { status: "APPOINTMENT", lastActivityAt: new Date() } })
  await prisma.activity.create({ data: { type: "APPOINTMENT_BOOKED", description: `Appointment booked with ${lead.name}`, organizationId: context.organizationId, leadId: lead.id, userId: context.userId } })
  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/leads/${lead.id}`)
  return { appointment }
}
