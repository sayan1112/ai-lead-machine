import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getAppointments, getUpcomingAppointments } from "@/lib/actions/appointments"
import { auth } from "@/lib/auth"
import AppointmentsClient from "./AppointmentsClient"

export const metadata = {
  title: "Appointments | AI Lead Machine",
  description: "Keep property visits, calls, and client meetings organized.",
}

async function AppointmentsContent() {
  const { appointments, total, error } = await getAppointments()
  const { appointments: upcoming } = await getUpcomingAppointments(7)

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      initialTotal={total}
      initialError={error}
      initialUpcoming={upcoming}
    />
  )
}

export default async function AppointmentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-100 rounded-lg mt-6" /></div>}>
        <AppointmentsContent />
      </Suspense>
    </div>
  )
}
