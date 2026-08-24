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
  try {
    const matches = await matchesForLead(result.context.organizationId, result.lead)
    
    // Build analysis prompt for AI
    const analysisPrompt = `Analyze this real estate lead and provide a comprehensive sales intelligence report.

LEAD DATA:
${facts(result.lead)}

MATCHING PROPERTIES: ${matches.length} available properties match the lead's requirements.

Provide a JSON response with the following structure:
{
  "leadSummary": "string - 2-3 sentence executive summary",
  "buyingIntentAssessment": "string - assessment of buying intent (HIGH/MEDIUM/LOW/UNCLEAR) with reasoning",
  "keyRequirements": ["string array - bullet points of key requirements"],
  "budgetFit": "string - analysis of budget fit with available inventory",
  "timelineAssessment": "string - assessment of timeline and urgency",
  "locationPropertyFit": "string - analysis of location and property type fit",
  "leadStrengths": ["string array - strengths of this lead"],
  "risksBlockers": ["string array - risks, blockers, or missing information"],
  "recommendedNextAction": "string - specific, actionable next step",
  "suggestedSalesStrategy": "string - recommended sales approach",
  "priorityReasoning": "string - why this lead should be prioritized or deprioritized",
  "urgency": "High|Medium|Low|Unclear",
  "buyingSellingIntent": "Buying|Selling|Not yet determined"
}

IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting or explanatory text.`

    const key = process.env.OPENAI_API_KEY
    let analysis: any = null
    let aiUnavailable = false

    if (key) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.3,
            messages: [
              { role: "system", content: "You are an expert real estate sales analyst. Analyze leads and provide actionable sales intelligence. Return ONLY valid JSON matching the requested structure." },
              { role: "user", content: analysisPrompt }
            ]
          }),
          signal: AbortSignal.timeout(15_000)
        })
        const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
        const content = payload.choices?.[0]?.message?.content?.trim()
        if (content) {
          try {
            analysis = JSON.parse(content)
          } catch {
            console.error("Failed to parse AI analysis response:", content)
          }
        }
      } catch (error) {
        console.error("AI analysis request failed:", error)
        aiUnavailable = true
      }
    } else {
      aiUnavailable = true
    }

    // Fallback deterministic analysis if AI is unavailable
    if (!analysis) {
      const budget = result.lead.budget
      const location = result.lead.location
      const propertyType = result.lead.propertyType
      const bedrooms = result.lead.bedrooms
      const timeline = result.lead.timeline
      const score = result.lead.score
      const classification = result.lead.classification

      const urgency = score >= 70 || (timeline && /immediate|urgent|asap|today|this week/i.test(timeline)) ? "High" : 
                      score >= 50 ? "Medium" : "Unclear"
      const buyingSellingIntent = result.lead.intent ? "Buying" : "Not yet determined"
      
      const requirements = [propertyType, bedrooms ? `${bedrooms} bedrooms` : null, location, budget ? `budget up to ₹${budget.toLocaleString("en-IN")}` : null, timeline ? `timeline: ${timeline}` : null].filter(Boolean)
      const qualificationSummary = score >= 60 ? "This lead has enough captured intent or requirements to move toward a direct sales conversation." : "More requirements are needed before this lead is fully qualified."
      const strengths = [budget ? "Budget is captured" : null, location ? "Location is captured" : null, propertyType || bedrooms ? "Property requirements are specific" : null, timeline ? "A buying timeline is available" : null, result.lead.email || result.lead.phone ? "Direct contact details are available" : null].filter(Boolean)
      const risksBlockers = [matches.length ? null : "No currently available inventory matches all captured requirements", !budget ? "Budget is still unknown" : null, !location ? "Preferred location is still unknown" : null, !timeline ? "Buying timeline needs confirmation" : null].filter(Boolean)
      
      analysis = {
        leadSummary: `${result.lead.name} is a ${classification.toLowerCase()} priority ${buyingSellingIntent.toLowerCase()} opportunity with a score of ${score}/100.`,
        buyingIntentAssessment: score >= 70 ? "HIGH - Lead shows strong buying signals with captured requirements and high score" : 
                                score >= 50 ? "MEDIUM - Lead has some requirements captured but needs more qualification" : 
                                "LOW/UNCLEAR - Insufficient data to determine buying intent",
        keyRequirements: requirements,
        budgetFit: budget ? `${matches.length ? "Within the current matching inventory" : "No confirmed inventory fit yet"} at up to ₹${budget.toLocaleString("en-IN")}.` : "Budget fit cannot be assessed until a budget is captured.",
        timelineAssessment: timeline ? `The stated timeline is ${timeline}; confirm the exact decision date and urgency.` : "Ask when the lead expects to make a decision.",
        locationPropertyFit: matches.length ? `${matches.length} available ${propertyType || "property"} option${matches.length === 1 ? "" : "s"} match the captured requirements.` : "No available property currently matches the captured requirements.",
        leadStrengths: strengths,
        risksBlockers: risksBlockers,
        recommendedNextAction: recommendation({ ...result.lead, score, propertyType, location, budget, timeline }, matches.length),
        suggestedSalesStrategy: matches.length ? "Share the matched inventory, confirm the preferred option, and move directly to a viewing appointment." : "Close the missing requirement gaps first, then follow up with a targeted shortlist.",
        priorityReasoning: `Lead score: ${score}/100 (${classification}). ${strengths.length} strengths identified. ${risksBlockers.length} risk factors present.`,
        urgency,
        buyingSellingIntent,
      }
    }

    await prisma.activity.create({ 
      data: { 
        type: "AI_LEAD_ANALYZED", 
        description: `AI analyzed ${result.lead.name}`, 
        metadata: JSON.stringify(analysis), 
        organizationId: result.context.organizationId, 
        leadId, 
        userId: result.context.userId 
      } 
    })
    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath("/dashboard/scoring")
    return { analysis, matches, score: { score: result.lead.score, classification: result.lead.classification, reasons: [] }, aiUnavailable }
  } catch (error) {
    console.error("Analyze Lead failed", { leadId, organizationId: result.context.organizationId, error })
    return { error: "Unable to analyze this lead right now. Please try again." }
  }
}

export async function generateSalesReply(leadId: string) {
  const result = await workspaceLead(leadId)
  if (!result.context) return { error: "Unauthorized" }
  if (!result.lead) return { error: "Lead not found in this workspace" }
  const matches = await matchesForLead(result.context.organizationId, result.lead)
  const key = process.env.OPENAI_API_KEY
  let reply = `Hi ${result.lead.name}, based on your requirement${result.lead.bedrooms ? ` for a ${result.lead.bedrooms} BHK` : ""}${result.lead.location ? ` in ${result.lead.location}` : ""}${result.lead.budget ? ` around ₹${(result.lead.budget / 10000000).toFixed(1)} Cr` : ""}, I've shortlisted ${matches.length ? "a few properties that match your preferences" : "the information currently available"}. I can also arrange a property visit at a convenient time.`
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
