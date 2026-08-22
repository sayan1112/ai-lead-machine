import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getFollowUps } from "@/lib/actions/followups"
import { getLeads } from "@/lib/actions/leads"
import FollowUpsClient from "./FollowUpsClient"

export const metadata = { title: "Follow-ups | AI Lead Machine", description: "Keep every opportunity moving with clear next actions." }

export default async function FollowUpsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const [{ followUps, error }, { leads }] = await Promise.all([getFollowUps(), getLeads()])
  return <FollowUpsClient initialFollowUps={followUps} initialLeads={leads} initialError={error} />
}
