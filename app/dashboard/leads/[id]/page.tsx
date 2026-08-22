import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getLeadById } from "@/lib/actions/leads"
import LeadConversation from "./LeadConversation"

export const metadata = { title: "Lead workspace | AI Lead Machine" }

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const { id } = await params
  const result = await getLeadById(id)
  if (!result.lead) notFound()
  return <LeadConversation lead={result.lead} />
}
