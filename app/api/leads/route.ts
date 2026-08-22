import { NextResponse } from "next/server"
import { getWorkspaceContext } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const context = await getWorkspaceContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const leads = await prisma.lead.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, name: true, email: true, phone: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Leads API failed", error)
    return NextResponse.json({ error: "Unable to load leads." }, { status: 500 })
  }
}
