import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorkspaceSettings } from "@/lib/actions/settings"
import SettingsClient from "./SettingsClient"

export const metadata = { title: "Settings | AI Lead Machine", description: "Manage your AI Lead Machine workspace and preferences." }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const result = await getWorkspaceSettings()
  if (result.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{result.error}</div>
  return <SettingsClient initialSettings={result.settings} />
}
