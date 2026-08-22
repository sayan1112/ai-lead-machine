import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const databaseUrl = String(process.env.DATABASE_URL || "")
  const connection = databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://") ? "postgresql" : databaseUrl.startsWith("file:") ? "sqlite" : databaseUrl ? "unsupported" : "missing"

  if (connection !== "postgresql") {
    return NextResponse.json({ ok: false, database: "unavailable", connection }, { status: 503 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, database: "connected", connection: "postgresql" })
  } catch (error) {
    console.error("Health database check failed", error)
    return NextResponse.json({ ok: false, database: "unavailable", connection: "postgresql" }, { status: 503 })
  }
}
