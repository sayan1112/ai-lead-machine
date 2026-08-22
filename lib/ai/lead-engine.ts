import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { WorkspaceContext } from "@/lib/auth-context"

const extractedLeadSchema = z.object({
  propertyType: z.string().nullable().default(null),
  bedrooms: z.number().int().positive().nullable().default(null),
  location: z.string().nullable().default(null),
  budget: z.number().int().positive().nullable().default(null),
  timeline: z.string().nullable().default(null),
  possessionPreference: z.string().nullable().default(null),
  intent: z.enum(["HIGH", "MEDIUM", "LOW"]).nullable().default(null),
})

export type ExtractedLead = z.infer<typeof extractedLeadSchema>

export type PropertyMatch = {
  id: string
  name: string
  type: string
  location: string
  price: number
  bedrooms: number | null
  possessionStatus: string | null
  description: string | null
}

function firstMatch(message: string, expression: RegExp) {
  return message.match(expression)?.[1]?.trim() || null
}

function parseBudget(message: string) {
  const match = message.match(/(?:₹|rs\.?|inr\s*)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lakh|lakhs|m)?\b/i)
  if (!match) return null
  const amount = Number(match[1])
  const unit = (match[2] || "").toLowerCase()
  if (unit === "cr" || unit.startsWith("crore")) return Math.round(amount * 10_000_000)
  if (unit === "l" || unit.startsWith("lakh")) return Math.round(amount * 100_000)
  if (unit === "m") return Math.round(amount * 1_000_000)
  return amount >= 1000 ? Math.round(amount) : null
}

function deterministicExtraction(message: string): ExtractedLead {
  const normalized = message.replace(/,/g, " ").replace(/\s+/g, " ").trim()
  const bedrooms = Number(firstMatch(normalized, /(\d+)\s*(?:bhk|bed(?:room)?s?)/i)) || null
  const propertyType = firstMatch(normalized, /\b(apartment|flat|villa|plot|commercial|office|retail)\b/i)
  const location = firstMatch(normalized, /\b(?:in|at|near|around)\s+([A-Za-z][A-Za-z\s]{1,30}?)(?=\s+(?:around|under|within|for|with|and|at|₹|rs\.?|inr)\b|[.!?,]|$)/i)
    || firstMatch(normalized, /\b(Pune|Mumbai|Bengaluru|Bangalore|Kolkata|Delhi|Noida|Gurgaon|Hyderabad|Chennai|Baner|Kharadi|Whitefield|Andheri)\b/i)
  const timeline = firstMatch(normalized, /\b(?:within|in)\s+((?:the\s+)?\d+\s+(?:days?|weeks?|months?|years?)|(?:three|six|twelve)\s+months?)\b/i)
    || firstMatch(normalized, /\b(?:move|moving)\s+(?:within\s+)?([^.!?,]{3,24})/i)
  const possessionPreference = /ready\s*(?:to)?\s*move|immediate|urgent/i.test(normalized)
    ? "Ready to move"
    : /under\s*construction/i.test(normalized) ? "Under construction" : null
  const intent = /\b(urgent|immediately|asap|visit|viewing|appointment|book|buy|purchase)\b/i.test(normalized)
    ? "HIGH"
    : (bedrooms || propertyType || location || parseBudget(normalized)) ? "MEDIUM" : null

  return extractedLeadSchema.parse({
    propertyType: propertyType ? (propertyType.toLowerCase() === "flat" ? "Apartment" : `${propertyType[0].toUpperCase()}${propertyType.slice(1).toLowerCase()}`) : null,
    bedrooms,
    location,
    budget: parseBudget(normalized),
    timeline,
    possessionPreference,
    intent,
  })
}

async function aiExtraction(message: string, existing: ExtractedLead) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return existing

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Extract only explicit real-estate requirements from the customer message. Never infer or invent missing values. Return JSON with propertyType, bedrooms, location, budget (integer INR), timeline, possessionPreference, intent (HIGH, MEDIUM, or LOW). Use null for unknown values.",
          },
          { role: "user", content: message },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return existing
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) return existing
    const parsed = extractedLeadSchema.safeParse(JSON.parse(content))
    return parsed.success ? parsed.data : existing
  } catch {
    return existing
  }
}

async function findPropertyMatches(organizationId: string, extracted: ExtractedLead): Promise<PropertyMatch[]> {
  const properties = await prisma.property.findMany({
    where: { organizationId, status: "AVAILABLE", availableUnits: { gt: 0 } },
    select: { id: true, name: true, type: true, location: true, price: true, bedrooms: true, possessionStatus: true, description: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  const requestedType = extracted.propertyType?.toLowerCase()
  const requestedLocation = extracted.location?.toLowerCase()
  return properties.filter((property) => {
    if (extracted.budget && property.price > extracted.budget) return false
    if (extracted.bedrooms && (property.bedrooms ?? 0) < extracted.bedrooms) return false
    if (requestedType && !property.type.toLowerCase().includes(requestedType.toLowerCase()) && !(requestedType === "apartment" && property.type.toLowerCase() === "flat")) return false
    if (requestedLocation && !`${property.location} ${property.name}`.toLowerCase().includes(requestedLocation)) return false
    return true
  }).slice(0, 5)
}

function appointmentIntent(message: string) {
  return /\b(appointment|visit|viewing|site visit|meet|schedule|show me)\b/i.test(message)
}

function calculateScore(lead: { budget: number | null; timeline: string | null; location: string | null; propertyType: string | null; bedrooms: number | null }, message: string, extracted: ExtractedLead, matches: PropertyMatch[], messageCount: number) {
  const reasons: string[] = []
  const budgetMatch = matches.length > 0 && Boolean(lead.budget || extracted.budget) ? 20 : 0
  if (budgetMatch) reasons.push("Budget matches available inventory")
  const timelineScore = lead.timeline || extracted.timeline ? 20 : 0
  if (timelineScore) reasons.push("Purchase timeline captured")
  const locationMatch = matches.length > 0 && Boolean(lead.location || extracted.location) ? 10 : 0
  if (locationMatch) reasons.push("Location matches available inventory")
  const propertyInterestScore = extracted.propertyType || extracted.bedrooms || extracted.location ? 15 : 0
  if (propertyInterestScore) reasons.push("Clear property requirements")
  const engagementScore = Math.min(10, Math.max(0, messageCount * 2))
  if (engagementScore) reasons.push("Active conversation engagement")
  const requestedAppointment = appointmentIntent(message)
  const appointmentScore = requestedAppointment ? 25 : 0
  if (appointmentScore) reasons.push("Requested an appointment or property visit")
  const score = Math.min(100, budgetMatch + timelineScore + locationMatch + propertyInterestScore + engagementScore + appointmentScore)
  const classification = score >= 80 ? "HOT" : score >= 50 ? "WARM" : "COLD"
  return { score, classification, budgetMatch, timelineScore, engagementScore, propertyInterestScore, locationMatch, conversationScore: appointmentScore, reasons }
}

function fallbackResponse(extracted: ExtractedLead, matches: PropertyMatch[], unavailable: boolean, needsAppointmentTime: boolean) {
  const requirement = [extracted.bedrooms ? `${extracted.bedrooms}BHK` : null, extracted.location, extracted.budget ? `up to ₹${(extracted.budget / 100000).toFixed(0)}L` : null].filter(Boolean).join(" in ")
  const lines = unavailable ? ["AI is temporarily unavailable. Your lead has been saved and a team member can continue the conversation."] : ["Thanks — I’ve captured your requirements."]
  if (requirement) lines.push(`I’m looking for ${requirement}.`)
  if (matches.length) {
    lines.push(`I found ${matches.length} available option${matches.length === 1 ? "" : "s"} in your workspace:`)
    lines.push(matches.map((property) => `• ${property.name} — ₹${(property.price / 100000).toFixed(0)}L, ${property.location}`).join("\n"))
  } else if (extracted.propertyType || extracted.location || extracted.budget || extracted.bedrooms) {
    lines.push("I don’t currently see a matching property in the available inventory. I can have a property consultant follow up with additional options.")
  } else {
    lines.push("Tell me your preferred location, budget, property type, and timeline so I can narrow down the right options.")
  }
  if (needsAppointmentTime) lines.push("I can help schedule a visit. What date and time works best?")
  return lines.join("\n\n")
}

async function generateResponse(message: string, extracted: ExtractedLead, matches: PropertyMatch[], needsAppointmentTime: boolean, aiConfig?: { agentName: string; tone: string; businessName: string | null; businessDescription: string | null; aiInstructions: string | null } | null) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { content: fallbackResponse(extracted, matches, true, needsAppointmentTime), unavailable: true }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: `You are ${aiConfig?.agentName || "an AI real-estate lead qualification assistant"}. Use a ${aiConfig?.tone || "professional"} tone. Discuss only the inventory in the provided context. Never invent a property, price, availability, amenity, discount, date, or location. If no match exists, say so and offer a consultant follow-up. Keep the response concise and helpful. Business context: ${aiConfig?.businessDescription || aiConfig?.businessName || "real-estate sales workspace"}. Additional instructions: ${aiConfig?.aiInstructions || "None"}` },
          { role: "user", content: JSON.stringify({ message, extracted, availableInventory: matches }) },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) throw new Error("AI request failed")
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content?.trim()
    if (!content) throw new Error("AI returned no response")
    return { content, unavailable: false }
  } catch {
    return { content: fallbackResponse(extracted, matches, true, needsAppointmentTime), unavailable: true }
  }
}

export async function processLeadMessage(context: WorkspaceContext, leadId: string, message: string) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, organizationId: context.organizationId } })
  if (!lead) return { ok: false as const, status: 404, error: "Lead not found" }

  const [conversation, aiConfig] = await Promise.all([prisma.conversation.findFirst({
    where: { leadId, organizationId: context.organizationId, status: "ACTIVE" },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  }), prisma.aIConfig.findUnique({ where: { organizationId: context.organizationId }, select: { agentName: true, tone: true, businessName: true, businessDescription: true, aiInstructions: true } })])
  const existing = extractedLeadSchema.parse({
    propertyType: lead.propertyType,
    bedrooms: lead.bedrooms,
    location: lead.location,
    budget: lead.budget,
    timeline: lead.timeline,
    possessionPreference: lead.possessionPreference || lead.possession,
    intent: lead.intent?.toUpperCase() || null,
  })
  const parsed = await aiExtraction(message, deterministicExtraction(message))
  const extracted = extractedLeadSchema.parse({
    propertyType: parsed.propertyType || existing.propertyType,
    bedrooms: parsed.bedrooms || existing.bedrooms,
    location: parsed.location || existing.location,
    budget: parsed.budget || existing.budget,
    timeline: parsed.timeline || existing.timeline,
    possessionPreference: parsed.possessionPreference || existing.possessionPreference,
    intent: parsed.intent || existing.intent,
  })
  const matches = await findPropertyMatches(context.organizationId, extracted)
  const score = calculateScore({ ...lead, propertyType: extracted.propertyType, bedrooms: extracted.bedrooms, location: extracted.location, budget: extracted.budget, timeline: extracted.timeline }, message, extracted, matches, (conversation?.messages.length || 0) + 1)
  const needsAppointmentTime = appointmentIntent(message)
  const generated = await generateResponse(message, extracted, matches, needsAppointmentTime, aiConfig)
  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const currentConversation = conversation
      ? await tx.conversation.update({ where: { id: conversation.id }, data: { extractedData: JSON.stringify(extracted), updatedAt: now } })
      : await tx.conversation.create({ data: { leadId, organizationId: context.organizationId, extractedData: JSON.stringify(extracted) } })
    await tx.message.create({ data: { conversationId: currentConversation.id, organizationId: context.organizationId, role: "USER", content: message } })
    await tx.message.create({ data: { conversationId: currentConversation.id, organizationId: context.organizationId, role: "ASSISTANT", content: generated.content, extractedData: JSON.stringify(extracted) } })
    const nextStatus = ["WON", "LOST", "APPOINTMENT"].includes(lead.status) ? lead.status : (extracted.propertyType || extracted.location || extracted.budget || extracted.bedrooms ? "QUALIFIED" : "CONTACTED")
    const updatedLead = await tx.lead.update({ where: { id: leadId }, data: { propertyType: extracted.propertyType, bedrooms: extracted.bedrooms, location: extracted.location, budget: extracted.budget, timeline: extracted.timeline, possession: extracted.possessionPreference, possessionPreference: extracted.possessionPreference, intent: extracted.intent?.toLowerCase(), score: score.score, classification: score.classification, status: nextStatus, lastActivityAt: now } })
    await tx.leadScore.create({ data: { leadId, organizationId: context.organizationId, ...score, reasoning: JSON.stringify(score.reasons) } })
    await tx.activity.createMany({ data: [
      { type: "CONVERSATION_MESSAGE", description: `New lead message from ${lead.name}`, organizationId: context.organizationId, leadId, userId: context.userId },
      { type: "AI_QUALIFICATION_COMPLETED", description: `AI extracted requirements and classified this lead as ${score.classification}`, metadata: JSON.stringify({ extracted, score: score.score, matches: matches.map((item) => item.id) }), organizationId: context.organizationId, leadId, userId: context.userId },
    ] })
    const pendingFollowUps = await tx.followUp.count({ where: { leadId, organizationId: context.organizationId, status: "PENDING" } })
    if (pendingFollowUps === 0 && !["WON", "LOST"].includes(nextStatus)) {
      let sequence = await tx.followUpSequence.findFirst({ where: { organizationId: context.organizationId, triggerEvent: "NEW_LEAD", isActive: true }, include: { steps: { orderBy: { order: "asc" } } } })
      if (!sequence) {
        sequence = await tx.followUpSequence.create({ data: { organizationId: context.organizationId, name: "New lead follow-up", description: "A conservative three-touch sequence for new property enquiries.", steps: { create: [
          { order: 1, delayHours: 24, channel: "WHATSAPP", message: "Just checking in — would you like me to send you properties matching your requirements?" },
          { order: 2, delayHours: 48, channel: "WHATSAPP", message: "I found a few options that may fit what you’re looking for. Would you like to see them?" },
          { order: 3, delayHours: 96, channel: "WHATSAPP", message: "Would you like to schedule a quick call with one of our property consultants?" },
        ] } }, include: { steps: { orderBy: { order: "asc" } } } })
      }
      let scheduledAt = now
      await Promise.all(sequence.steps.map(async (step) => {
        scheduledAt = new Date(scheduledAt.getTime() + step.delayHours * 60 * 60 * 1000)
        return tx.followUp.create({ data: { leadId, organizationId: context.organizationId, stepId: step.id, scheduledAt, channel: step.channel, message: step.message } })
      }))
    }
    return { updatedLead, conversationId: currentConversation.id }
  })

  return { ok: true as const, ...result, assistantMessage: generated.content, extracted, matches, score, appointmentRequested: needsAppointmentTime, aiUnavailable: generated.unavailable }
}
