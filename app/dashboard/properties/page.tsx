import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/actions/properties"
import { auth } from "@/lib/auth"
import PropertiesClient from "./PropertiesClient"

export const metadata = {
  title: "Properties | AI Lead Machine",
  description: "Manage your property inventory and connect opportunities to the right listings.",
}

async function PropertiesContent() {
  const { properties, total, error } = await getProperties()

  return (
    <PropertiesClient
      initialProperties={properties}
      initialTotal={total}
      initialError={error}
    />
  )
}

export default async function PropertiesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-100 rounded-lg mt-6" /></div>}>
        <PropertiesContent />
      </Suspense>
    </div>
  )
}
