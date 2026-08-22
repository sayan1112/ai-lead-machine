"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getDashboardStats() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { error: "Unauthorized" }
    }

    const orgId = session.user.organizationId

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      hotLeads,
      convertedLeads,
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      totalProperties,
      availableProperties,
      soldProperties,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId } }),
      prisma.lead.count({ where: { organizationId: orgId, status: "NEW" } }),
      prisma.lead.count({ where: { organizationId: orgId, status: "CONTACTED" } }),
      prisma.lead.count({ where: { organizationId: orgId, status: "QUALIFIED" } }),
      prisma.lead.count({ where: { organizationId: orgId, status: "HOT" } }),
      prisma.lead.count({ where: { organizationId: orgId, status: "CONVERTED" } }),
      prisma.appointment.count({ where: { organizationId: orgId } }),
      prisma.appointment.count({ where: { organizationId: orgId, status: "SCHEDULED" } }),
      prisma.appointment.count({ where: { organizationId: orgId, status: "COMPLETED" } }),
      prisma.property.count({ where: { organizationId: orgId } }),
      prisma.property.count({ where: { organizationId: orgId, status: "AVAILABLE" } }),
      prisma.property.count({ where: { organizationId: orgId, status: "SOLD" } }),
    ])

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0"

    return {
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        hot: hotLeads,
        converted: convertedLeads,
      },
      appointments: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        completed: completedAppointments,
      },
      properties: {
        total: totalProperties,
        available: availableProperties,
        sold: soldProperties,
      },
      conversionRate: parseFloat(conversionRate),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { error: "Failed to fetch dashboard stats" }
  }
}

export async function getRecentLeads(limit: number = 5) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { leads: [], error: "Unauthorized" }
    }

    const leads = await prisma.lead.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return { leads }
  } catch (error) {
    console.error("Error fetching recent leads:", error)
    return { leads: [], error: "Failed to fetch recent leads" }
  }
}

export async function getUpcomingAppointments(limit: number = 5) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { appointments: [], error: "Unauthorized" }
    }

    const now = new Date()

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: session.user.organizationId,
        date: { gte: now },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        lead: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, location: true } },
      },
      orderBy: { date: "asc" },
      take: limit,
    })

    return { appointments }
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return { appointments: [], error: "Failed to fetch upcoming appointments" }
  }
}

export async function getLeadStatusDistribution() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { distribution: [], error: "Unauthorized" }
    }

    const leads = await prisma.lead.groupBy({
      by: ["status"],
      where: { organizationId: session.user.organizationId },
      _count: { status: true },
    })

    const distribution = leads.map((l) => ({
      status: l.status,
      count: l._count.status,
    }))

    return { distribution }
  } catch (error) {
    console.error("Error fetching lead status distribution:", error)
    return { distribution: [], error: "Failed to fetch distribution" }
  }
}

export async function getLeadSourceDistribution() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { distribution: [], error: "Unauthorized" }
    }

    const leads = await prisma.lead.groupBy({
      by: ["source"],
      where: { organizationId: session.user.organizationId },
      _count: { source: true },
    })

    const distribution = leads.map((l) => ({
      source: l.source,
      count: l._count.source,
    }))

    return { distribution }
  } catch (error) {
    console.error("Error fetching lead source distribution:", error)
    return { distribution: [], error: "Failed to fetch distribution" }
  }
}

export async function getMonthlyLeadTrend(months: number = 6) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { trend: [], error: "Unauthorized" }
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const leads = await prisma.lead.findMany({
      where: {
        organizationId: session.user.organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true },
    })

    const trend: Record<string, number> = {}

    leads.forEach((lead) => {
      const month = lead.createdAt.toISOString().slice(0, 7) // YYYY-MM
      trend[month] = (trend[month] || 0) + 1
    })

    const sortedMonths = Object.keys(trend).sort()
    const trendData = sortedMonths.map((month) => ({
      month,
      count: trend[month],
    }))

    return { trend: trendData }
  } catch (error) {
    console.error("Error fetching monthly lead trend:", error)
    return { trend: [], error: "Failed to fetch trend" }
  }
}