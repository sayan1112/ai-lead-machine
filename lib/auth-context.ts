import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type WorkspaceContext = {
  userId: string
  organizationId: string
}

/**
 * Server-only authorization guard. The organization is re-checked against the
 * database so stale JWT claims cannot grant access to another workspace.
 */
export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: session.user.organizationId ?? undefined,
    },
    select: { id: true, organizationId: true },
  })

  if (!user?.organizationId) return null

  return { userId: user.id, organizationId: user.organizationId }
}

export function safeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.name === "ZodError") {
    return "Please check the highlighted fields and try again."
  }
  return fallback
}
