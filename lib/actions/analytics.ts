"use server"

import { getWorkspaceContext } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"

export async function getAnalyticsData() {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { error: "Unauthorized" as const }
    const organizationId = context.organizationId
    const now = new Date()
    const [totalLeads, qualifiedLeads, hotLeads, wonLeads, appointments, completedAppointments, sourceGroups, statusGroups, followUpGroups, monthlyLeads, matchingActivities] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.lead.count({ where: { organizationId, status: { in: ["QUALIFIED", "APPOINTMENT", "NEGOTIATION", "WON"] } } }),
      prisma.lead.count({ where: { organizationId, classification: "HOT" } }),
      prisma.lead.count({ where: { organizationId, status: "WON" } }),
      prisma.appointment.count({ where: { organizationId } }),
      prisma.appointment.count({ where: { organizationId, status: "COMPLETED" } }),
      prisma.lead.groupBy({ by: ["source"], where: { organizationId }, _count: { source: true } }),
      prisma.lead.groupBy({ by: ["status"], where: { organizationId }, _count: { status: true } }),
      prisma.followUp.groupBy({ by: ["status"], where: { organizationId }, _count: { status: true } }),
      prisma.lead.findMany({ where: { organizationId }, select: { createdAt: true, budget: true, status: true }, orderBy: { createdAt: "asc" } }),
      prisma.activity.count({ where: { organizationId, type: "AI_QUALIFICATION_COMPLETED" } }),
    ])

    const monthly: Record<string, { month: string; leads: number; pipelineValue: number }> = {}
    for (const lead of monthlyLeads) {
      const month = lead.createdAt.toISOString().slice(0, 7)
      monthly[month] ||= { month, leads: 0, pipelineValue: 0 }
      monthly[month].leads += 1
      if (!(["WON", "LOST"] as string[]).includes(lead.status)) monthly[month].pipelineValue += lead.budget || 0
    }

    return {
      stats: {
        totalLeads,
        qualifiedLeads,
        hotLeads,
        appointments,
        completedAppointments,
        conversionRate: totalLeads ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0,
        matchingActivities,
      },
      sources: sourceGroups.map((item) => ({ source: item.source, count: item._count.source })),
      statuses: statusGroups.map((item) => ({ status: item.status, count: item._count.status })),
      followUps: followUpGroups.map((item) => ({ status: item.status, count: item._count.status })),
      monthly: Object.values(monthly).slice(-6),
      generatedAt: now.toISOString(),
    }
  } catch (error) {
    console.error("Analytics query failed", error)
    return { error: "Unable to load analytics right now." as const }
  }
}
