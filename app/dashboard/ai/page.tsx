import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAssistantLeads } from "@/lib/actions/ai-assistant"
import AIClient from "./AIClient"

export const metadata = { title: "AI Assistant | AI Lead Machine", description: "Turn lead context into the next best sales action." }

export default async function AIAssistantPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const data = await getAssistantLeads()
  return <AIClient initialLeads={data.leads} initialError={data.error} />
}
