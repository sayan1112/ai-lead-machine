"use server"

import { getWorkspaceContext } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"

function defaultReasoning(lead: { budget: number | null; timeline: string | null; location: string | null; propertyType: string | null; bedrooms: number | null; email: string | null; phone: string | null }) {
  return [
    lead.budget ? "Budget captured" : null,
    lead.timeline ? "Timeline captured" : null,
    lead.location ? "Preferred location captured" : null,
    lead.propertyType || lead.bedrooms ? "Property requirements captured" : null,
    lead.email || lead.phone ? "Contact details available" : null,
  ].filter(Boolean) as string[]
}

export async function getScoringData() {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { leads: [], error: "Unauthorized" }
    const leads = await prisma.lead.findMany({
      where: { organizationId: context.organizationId },
      select: {
        id: true, name: true, email: true, phone: true, status: true, score: true, classification: true,
        budget: true, location: true, propertyType: true, bedrooms: true, timeline: true,
        leadScores: { orderBy: { createdAt: "desc" }, take: 1, select: { score: true, classification: true, reasoning: true, createdAt: true } },
      },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    })
    return {
      leads: leads.map((lead) => {
        const latest = lead.leadScores[0]
        let reasons = defaultReasoning(lead)
        if (latest?.reasoning) {
          try {
            const parsed = JSON.parse(latest.reasoning)
            if (Array.isArray(parsed)) reasons = parsed.filter((item): item is string => typeof item === "string")
            else if (parsed?.reasons && Array.isArray(parsed.reasons)) reasons = parsed.reasons
          } catch { /* Keep the human-readable fallback. */ }
        }
        return { ...lead, score: latest?.score ?? lead.score, classification: latest?.classification ?? lead.classification, reasons }
      }),
    }
  } catch (error) {
    console.error("Scoring query failed", error)
    return { leads: [], error: "Unable to load lead scoring right now." }
  }
}
