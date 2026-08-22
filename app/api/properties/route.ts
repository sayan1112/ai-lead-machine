import { NextResponse } from "next/server"
import { getWorkspaceContext } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const context = await getWorkspaceContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const properties = await prisma.property.findMany({
      where: { organizationId: context.organizationId, status: "AVAILABLE", availableUnits: { gt: 0 } },
      select: { id: true, name: true, location: true, price: true, bedrooms: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Properties API failed", error)
    return NextResponse.json({ error: "Unable to load properties." }, { status: 500 })
  }
}
