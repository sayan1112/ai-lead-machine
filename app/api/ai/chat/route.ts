import { NextResponse } from "next/server"
import { z } from "zod"
import { getWorkspaceContext } from "@/lib/auth-context"
import { processLeadMessage } from "@/lib/ai/lead-engine"
import { checkRateLimit } from "@/lib/rate-limit"

const requestSchema = z.object({
  leadId: z.string().min(1),
  message: z.string().trim().min(1, "Message is required").max(4_000, "Message is too long"),
})

export async function POST(request: Request) {
  const context = await getWorkspaceContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rate = checkRateLimit(`ai-chat:${context.organizationId}:${context.userId}`)
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } })
  }

  try {
    const body = requestSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: "Please provide a valid lead and message." }, { status: 400 })
    const result = await processLeadMessage(context, body.data.leadId, body.data.message)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json(result)
  } catch (error) {
    console.error("AI chat route failed", error)
    return NextResponse.json({ error: "We could not process that message. Please try again." }, { status: 500 })
  }
}
