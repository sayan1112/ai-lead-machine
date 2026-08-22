import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organizationName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
})

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "workspace"
}

export async function POST(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rate = checkRateLimit(`signup:${key}`, 5, 60 * 60 * 1000)
  if (!rate.allowed) return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 })
  const body = registrationSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return NextResponse.json({ error: "Please enter a valid name, workspace, email, and password." }, { status: 400 })
  try {
    const existing = await prisma.user.findUnique({ where: { email: body.data.email }, select: { id: true } })
    if (existing) return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 })
    const password = await bcrypt.hash(body.data.password, 12)
    const baseSlug = slugify(body.data.organizationName)
    const organization = await prisma.$transaction(async (tx) => {
      let slug = baseSlug
      let suffix = 1
      while (await tx.organization.findUnique({ where: { slug }, select: { id: true } })) slug = `${baseSlug}-${suffix++}`
      const createdOrganization = await tx.organization.create({ data: { name: body.data.organizationName, slug } })
      const user = await tx.user.create({ data: { name: body.data.name, email: body.data.email, password, organizationId: createdOrganization.id } })
      await tx.organizationMember.create({ data: { organizationId: createdOrganization.id, userId: user.id, role: "OWNER" } })
      await tx.aIConfig.create({ data: { organizationId: createdOrganization.id, businessName: body.data.organizationName } })
      await tx.followUpSequence.create({ data: { organizationId: createdOrganization.id, name: "New lead follow-up", description: "A conservative three-touch sequence for new property enquiries.", steps: { create: [
          { order: 1, delayHours: 24, channel: "WHATSAPP", message: "Just checking in — would you like me to send you properties matching your requirements?" },
          { order: 2, delayHours: 48, channel: "WHATSAPP", message: "I found a few options that may fit what you’re looking for. Would you like to see them?" },
          { order: 3, delayHours: 96, channel: "WHATSAPP", message: "Would you like to schedule a quick call with one of our property consultants?" },
        ] } },
      })
      return createdOrganization
    })
    return NextResponse.json({ success: true, organizationId: organization.id }, { status: 201 })
  } catch (error) {
    console.error("Registration failed", error)
    return NextResponse.json({ error: "We could not create your workspace right now. Please try again." }, { status: 500 })
  }
}
