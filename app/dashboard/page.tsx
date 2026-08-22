import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowUpRight, CalendarDays, CheckCircle2, CircleDollarSign, Home, Sparkles, Users } from "lucide-react";

export const metadata = {
  title: "Sales Overview | AI Lead Machine",
  description: "Track your real estate pipeline, opportunities, appointments, and conversions.",
};

const metrics = [
  { label: "Total Leads", value: "1,248", detail: "All property enquiries", icon: Users, color: "bg-sky-50 text-sky-700" },
  { label: "Qualified Leads", value: "684", detail: "Ready for a next step", icon: CheckCircle2, color: "bg-violet-50 text-violet-700" },
  { label: "Appointments", value: "186", detail: "Visits, calls & meetings", icon: CalendarDays, color: "bg-amber-50 text-amber-700" },
  { label: "Active Properties", value: "92", detail: "Available inventory", icon: Home, color: "bg-emerald-50 text-emerald-700" },
];

const pipeline = [
  ["New", "128", "bg-sky-400", "16%"],
  ["Contacted", "284", "bg-cyan-400", "34%"],
  ["Qualified", "684", "bg-violet-400", "68%"],
  ["Appointment", "186", "bg-amber-400", "45%"],
  ["Negotiation", "74", "bg-orange-400", "27%"],
  ["Won", "42", "bg-emerald-400", "18%"],
];

const recentLeads = [
  ["Aarav Mehta", "2BHK apartment · Pune", "₹85L", "Qualified", "bg-violet-50 text-violet-700"],
  ["Priya Sharma", "3BHK family home · Mumbai", "₹1.2Cr", "Appointment", "bg-amber-50 text-amber-700"],
  ["Rahul Sen", "Investment property · Kolkata", "₹70L", "New", "bg-sky-50 text-sky-700"],
  ["Ananya Kapoor", "Premium apartment · Pune", "₹1.5Cr", "Contacted", "bg-cyan-50 text-cyan-700"],
];

const appointments = [
  ["Property Visit", "Aarav Mehta", "2BHK Apartment, Baner", "Today · 4:30 PM"],
  ["Client Consultation", "Priya Sharma", "3BHK Investment Discussion", "Tomorrow · 11:00 AM"],
  ["Site Visit", "Rahul Sen", "Premium Residential Project", "Tomorrow · 3:00 PM"],
];

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><Sparkles size={13} /> Demo workspace data</div><h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Sales Overview</h1><p className="mt-2 text-sm text-slate-500">Track your real estate pipeline, opportunities, appointments, and conversions.</p></div>
        <Link href="/dashboard/leads" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#10243a]">Review priority leads <ArrowUpRight size={16} /></Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></span></div><p className="mt-3 text-xs text-slate-400">{detail}</p></article>)}</section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-950">Lead Pipeline</h2><p className="mt-1 text-xs text-slate-500">A clear view of where property opportunities stand.</p></div><Link href="/dashboard/leads" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">View all leads</Link></div><div className="mt-7 space-y-4">{pipeline.map(([label, value, color, width]) => <div key={label}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">{label}</span><span className="font-semibold text-slate-900">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width }} /></div></div>)}</div><div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Won: 42</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />Lost: 31</span><span className="ml-auto font-semibold text-emerald-700">Conversion rate: 14.8%</span></div></article>
        <article className="rounded-2xl bg-[#10243a] p-6 text-white shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Conversion performance</p><p className="mt-1 text-xs text-slate-400">Illustrative workspace view</p></div><CircleDollarSign size={20} className="text-emerald-300" /></div><p className="mt-10 text-5xl font-semibold tracking-tight">14.8%</p><p className="mt-2 text-sm text-slate-400">qualified leads converted to closings</p><div className="mt-10 flex h-20 items-end gap-2">{[32, 44, 37, 60, 51, 69, 64, 86].map((height, index) => <div key={index} className="flex-1 rounded-t bg-emerald-300/80" style={{ height: `${height}%` }} />)}</div><p className="mt-2 text-[11px] text-slate-500">Last 8 weeks</p></article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-slate-950">Recent Leads</h2><p className="mt-1 text-xs text-slate-500">The latest property enquiries in your pipeline.</p></div><Link href="/dashboard/leads" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Manage leads</Link></div><div className="divide-y divide-slate-100">{recentLeads.map(([name, interest, budget, status, statusClass]) => <div key={name} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-semibold text-slate-900">{name}</p><p className="mt-1 text-xs text-slate-500">{interest}</p></div><div className="flex items-center gap-4"><span className="text-sm font-medium text-slate-700">{budget}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>{status}</span></div></div>)}</div></article>
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-slate-950">Upcoming Appointments</h2><p className="mt-1 text-xs text-slate-500">Stay prepared for every client conversation.</p></div><Link href="/dashboard/appointments" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">View calendar</Link></div><div className="divide-y divide-slate-100">{appointments.map(([type, name, detail, time]) => <div key={`${type}-${name}`} className="px-5 py-4 sm:px-6"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{type}</p><span className="whitespace-nowrap text-[11px] font-semibold text-emerald-700">{time}</span></div><p className="mt-1 text-xs text-slate-600">{name}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>)}</div></article>
      </section>
    </div>
  );
}
