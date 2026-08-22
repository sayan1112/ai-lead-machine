"use server"

import { prisma } from "@/lib/prisma"
import { getWorkspaceContext } from "@/lib/auth-context"

export async function getDashboardData() {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { error: "Unauthorized" as const }
    const organizationId = context.organizationId
    const now = new Date()
    const [
      totalLeads, qualifiedLeads, hotLeads, wonLeads, totalAppointments,
      activeProperties, pipelineValue, statusGroups, recentLeads, upcomingAppointments,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.lead.count({ where: { organizationId, status: { in: ["QUALIFIED", "APPOINTMENT", "NEGOTIATION", "WON"] } } }),
      prisma.lead.count({ where: { organizationId, classification: "HOT" } }),
      prisma.lead.count({ where: { organizationId, status: "WON" } }),
      prisma.appointment.count({ where: { organizationId, status: { in: ["SCHEDULED", "CONFIRMED"] }, date: { gte: now } } }),
      prisma.property.count({ where: { organizationId, status: "AVAILABLE", availableUnits: { gt: 0 } } }),
      prisma.lead.aggregate({ where: { organizationId, status: { notIn: ["LOST", "WON"] } }, _sum: { budget: true } }),
      prisma.lead.groupBy({ by: ["status"], where: { organizationId }, _count: { status: true } }),
      prisma.lead.findMany({ where: { organizationId }, select: { id: true, name: true, propertyType: true, bedrooms: true, location: true, budget: true, status: true, classification: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.appointment.findMany({ where: { organizationId, date: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } }, select: { id: true, date: true, duration: true, status: true, lead: { select: { id: true, name: true } }, property: { select: { id: true, name: true, location: true } } }, orderBy: { date: "asc" }, take: 5 }),
    ])
    const pipeline = ["NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT", "NEGOTIATION", "WON", "LOST"].map((status) => ({ status, count: statusGroups.find((item) => item.status === status)?._count.status || 0 }))
    return { stats: { totalLeads, qualifiedLeads, hotLeads, appointments: totalAppointments, activeProperties, wonLeads, conversionRate: totalLeads ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0, pipelineValue: pipelineValue._sum.budget || 0 }, pipeline, recentLeads, upcomingAppointments }
  } catch (error) {
    console.error("Dashboard query failed", error)
    return { error: "Unable to load dashboard data right now." as const }
  }
}

export async function getDashboardStats() {
  const data = await getDashboardData()
  if ("error" in data) return data
  return { ...data.stats, conversionRate: data.stats.conversionRate }
}

export async function getRecentLeads(limit = 5) {
  const data = await getDashboardData()
  if ("error" in data) return { leads: [], error: data.error }
  return { leads: data.recentLeads.slice(0, limit) }
}

export async function getUpcomingAppointments(limit = 5) {
  const data = await getDashboardData()
  if ("error" in data) return { appointments: [], error: data.error }
  return { appointments: data.upcomingAppointments.slice(0, limit) }
}

export async function getLeadStatusDistribution() {
  const data = await getDashboardData()
  if ("error" in data) return { distribution: [], error: data.error }
  return { distribution: data.pipeline.map(({ status, count }) => ({ status, count })) }
}

export async function getLeadSourceDistribution() {
  const context = await getWorkspaceContext()
  if (!context) return { distribution: [], error: "Unauthorized" }
  const groups = await prisma.lead.groupBy({ by: ["source"], where: { organizationId: context.organizationId }, _count: { source: true } })
  return { distribution: groups.map((group) => ({ source: group.source, count: group._count.source })) }
}

export async function getMonthlyLeadTrend(months = 6) {
  const context = await getWorkspaceContext()
  if (!context) return { trend: [], error: "Unauthorized" }
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  const leads = await prisma.lead.findMany({ where: { organizationId: context.organizationId, createdAt: { gte: start } }, select: { createdAt: true } })
  const values: Record<string, number> = {}
  for (const lead of leads) {
    const month = lead.createdAt.toISOString().slice(0, 7)
    values[month] = (values[month] || 0) + 1
  }
  return { trend: Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })) }
}
