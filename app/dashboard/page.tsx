import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/lib/actions/dashboard"
import { ArrowUpRight, BarChart3, CalendarDays, CheckCircle2, CircleDollarSign, Home, Sparkles, Users } from "lucide-react"

export const metadata = { title: "Sales Overview | AI Lead Machine", description: "Track your real estate pipeline, opportunities, appointments, and conversions." }

const statusLabel = (value: string) => value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
const money = (value: number | null | undefined) => value ? `₹${(value / 100000).toFixed(value >= 10_000_000 ? 1 : 0)}L` : "—"
const colors = ["bg-sky-400", "bg-cyan-400", "bg-violet-400", "bg-amber-400", "bg-orange-400", "bg-emerald-400", "bg-slate-300"]

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const data = await getDashboardData()
  if ("error" in data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{data.error}</div>
  const maxPipeline = Math.max(1, ...data.pipeline.map((item) => item.count))
  const hasActivity = data.stats.totalLeads > 0 || data.stats.activeProperties > 0 || data.stats.appointments > 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><Sparkles size={13} /> Live workspace data</div><h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Sales Overview</h1><p className="mt-2 text-sm text-slate-500">Track your real estate pipeline, opportunities, appointments, and conversions.</p></div>
        <Link href="/dashboard/leads" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#10243a]">Review priority leads <ArrowUpRight size={16} /></Link>
      </section>

      {!hasActivity && <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-base font-semibold text-slate-900">No activity yet</p><p className="mt-2 text-sm text-slate-500">Add your first lead or property to start building your workspace view.</p><Link href="/dashboard/leads" className="mt-5 inline-flex rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white">Add your first lead</Link></section>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[
        { label: "Total Leads", value: data.stats.totalLeads, detail: "All property enquiries", icon: Users, color: "bg-sky-50 text-sky-700" },
        { label: "Hot Leads", value: data.stats.hotLeads, detail: "Highest-priority opportunities", icon: Sparkles, color: "bg-rose-50 text-rose-700" },
        { label: "Upcoming Follow-ups", value: data.stats.upcomingFollowUps, detail: "Pending next actions", icon: CheckCircle2, color: "bg-violet-50 text-violet-700" },
        { label: "Appointments", value: data.stats.appointments, detail: "Workspace appointments", icon: CalendarDays, color: "bg-amber-50 text-amber-700" },
        { label: "Properties", value: data.stats.activeProperties, detail: "Available inventory", icon: Home, color: "bg-emerald-50 text-emerald-700" },
        { label: "Conversion Rate", value: `${data.stats.conversionRate}%`, detail: "Won leads ÷ total leads", icon: BarChart3, color: "bg-cyan-50 text-cyan-700" },
      ].map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></span></div><p className="mt-3 text-xs text-slate-400">{detail}</p></article>)} </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-950">Lead Pipeline</h2><p className="mt-1 text-xs text-slate-500">A clear view of where property opportunities stand.</p></div><Link href="/dashboard/leads" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">View all leads</Link></div><div className="mt-7 space-y-4">{data.pipeline.map(({ status, count }, index) => <div key={status}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium capitalize text-slate-600">{statusLabel(status)}</span><span className="font-semibold text-slate-900">{count}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${colors[index]}`} style={{ width: `${Math.max(count ? 5 : 0, (count / maxPipeline) * 100)}%` }} /></div></div>)}</div><div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Hot: {data.stats.hotLeads}</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Won: {data.stats.wonLeads}</span><span className="ml-auto font-semibold text-emerald-700">Conversion rate: {data.stats.conversionRate}%</span></div></article>
        <article className="rounded-2xl bg-[#10243a] p-6 text-white shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Pipeline value</p><p className="mt-1 text-xs text-slate-400">Based on active lead budgets</p></div><CircleDollarSign size={20} className="text-emerald-300" /></div><p className="mt-10 text-4xl font-semibold tracking-tight">{money(data.stats.pipelineValue)}</p><p className="mt-2 text-sm text-slate-400">estimated value still in motion</p><div className="mt-10 flex h-20 items-end gap-2">{data.pipeline.map(({ status, count }) => <div key={status} className="flex-1 rounded-t bg-emerald-300/80" style={{ height: `${Math.max(count ? 8 : 2, (count / maxPipeline) * 100)}%` }} />)}</div><p className="mt-2 text-[11px] text-slate-500">Current status distribution</p></article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-slate-950">Recent Leads</h2><p className="mt-1 text-xs text-slate-500">The latest property enquiries in your pipeline.</p></div><Link href="/dashboard/leads" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Manage leads</Link></div><div className="divide-y divide-slate-100">{data.recentLeads.length ? data.recentLeads.map((lead) => <Link href={`/dashboard/leads/${lead.id}`} key={lead.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-semibold text-slate-900">{lead.name}</p><p className="mt-1 text-xs capitalize text-slate-500">{[lead.bedrooms ? `${lead.bedrooms}BHK` : null, lead.propertyType, lead.location].filter(Boolean).join(" · ") || "Requirements not captured yet"}</p></div><div className="flex items-center gap-4"><span className="text-sm font-medium text-slate-700">{money(lead.budget)}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-700">{statusLabel(lead.status)}</span></div></Link>) : <p className="px-6 py-8 text-sm text-slate-500">No activity yet.</p>}</div></article>
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-slate-950">Upcoming Appointments</h2><p className="mt-1 text-xs text-slate-500">Stay prepared for every client conversation.</p></div><Link href="/dashboard/appointments" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">View calendar</Link></div><div className="divide-y divide-slate-100">{data.upcomingAppointments.length ? data.upcomingAppointments.map((appointment) => <div key={appointment.id} className="px-5 py-4 sm:px-6"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{appointment.lead.name}</p><span className="whitespace-nowrap text-[11px] font-semibold text-emerald-700">{new Date(appointment.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span></div><p className="mt-1 text-xs text-slate-600">{appointment.property?.name || "Client consultation"}</p><p className="mt-1 text-xs text-slate-400">{appointment.duration} minute appointment · {statusLabel(appointment.status)}</p></div>) : <p className="px-6 py-8 text-sm text-slate-500">No activity yet.</p>}</div></article>
      </section>
    </div>
  )
}
