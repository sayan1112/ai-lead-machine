import DashboardLayout from "./layout"

export const metadata = {
  title: "Dashboard | Overview",
  description: "Welcome to the AI Lead Machine overview dashboard",
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
          <p className="text-2xl font-light text-gray-900">1,024</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
          <p className="text-2xl font-light text-gray-900">350</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-500">Properties</h3>
          <p className="text-2xl font-light text-gray-900">85</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-light text-gray-900">12.5%</p>
        </div>
      </div>
    </DashboardLayout>
  )
}