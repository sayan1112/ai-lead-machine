"use server"

import { prisma } from "@/lib/prisma"
import { getWorkspaceContext, safeError } from "@/lib/auth-context"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const aiConfigSchema = z.object({
  agentName: z.string().trim().min(2).max(120),
  businessName: z.string().trim().max(120).optional(),
  businessDescription: z.string().trim().max(2_000).optional(),
  tone: z.enum(["professional", "friendly", "casual"]),
  languages: z.string().trim().max(100),
  aiInstructions: z.string().trim().max(4_000).optional(),
})

export async function getWorkspaceSettings() {
  const context = await getWorkspaceContext()
  if (!context) return { settings: null, error: "Unauthorized" }
  const [organization, user, aiConfig] = await Promise.all([
    prisma.organization.findUnique({ where: { id: context.organizationId }, select: { id: true, name: true, slug: true } }),
    prisma.user.findUnique({ where: { id: context.userId }, select: { name: true, email: true } }),
    prisma.aIConfig.findUnique({ where: { organizationId: context.organizationId } }),
  ])
  return { settings: { organization, user, aiConfig } }
}

export async function updateAIConfig(data: z.infer<typeof aiConfigSchema>) {
  try {
    const context = await getWorkspaceContext()
    if (!context) return { config: null, error: "Unauthorized" }
    const validated = aiConfigSchema.parse(data)
    const config = await prisma.aIConfig.upsert({ where: { organizationId: context.organizationId }, create: { ...validated, organizationId: context.organizationId }, update: validated })
    revalidatePath("/dashboard/settings")
    return { config }
  } catch (error) {
    console.error("AI settings update failed", error)
    return { config: null, error: safeError(error, "Unable to save AI settings right now.") }
  }
}
