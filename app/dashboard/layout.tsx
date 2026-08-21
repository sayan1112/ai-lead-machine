import "@/app/globals.css"

export const metadata = {
  title: "Dashboard | AI Lead Machine",
  description: "Manage your leads and organization efficiently",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-800 text-white fixed top-0 left-0 h-screen">
        <div className="text-center p-4 bg-gray-900">
          <h1 className="text-lg font-bold">AI Lead Machine</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li className="px-4 py-3 hover:bg-gray-700">
              <a href="/dashboard/overview">Overview</a>
            </li>
            <li className="px-4 py-3 hover:bg-gray-700">
              <a href="/dashboard/leads">Leads</a>
            </li>
            <li className="px-4 py-3 hover:bg-gray-700">
              <a href="/dashboard/appointments">Appointments</a>
            </li>
            <li className="px-4 py-3 hover:bg-gray-700">
              <a href="/dashboard/properties">Properties</a>
            </li>
            <li className="px-4 py-3 hover:bg-gray-700">
              <a href="/dashboard/settings">Settings</a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-4">{children}</main>
    </div>
  )
}