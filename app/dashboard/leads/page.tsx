import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getLeads } from "@/lib/actions/leads"
import { auth } from "@/lib/auth"
import LeadsClient from "./LeadsClient"

async function LeadsContent() {
  const { leads, total, error } = await getLeads()

  return (
    <LeadsClient
      initialLeads={leads}
      initialTotal={total}
      initialError={error}
    />
  )
}

export default async function LeadsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-100 rounded-lg mt-6" /></div>}>
        <LeadsContent />
      </Suspense>
    </div>
  )
}
