import Link from "next/link";
import { BarChart3, Building2, CalendarDays, LayoutDashboard, Settings, Sparkles, Users } from "lucide-react";
import "@/app/globals.css";

export const metadata = {
  title: "Workspace | AI Lead Machine",
  description: "AI-powered real estate growth workspace for leads, appointments, and properties.",
};

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#07111f] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f]"><Sparkles size={18} /></span>
            <span><span className="block text-sm font-semibold">AI Lead Machine</span><span className="mt-0.5 block text-[11px] text-slate-400">AI-powered real estate growth</span></span>
          </Link>
        </div>
        <div className="px-4 pt-7"><p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p><nav className="mt-3 space-y-1" aria-label="Workspace navigation">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><Icon size={17} className="text-slate-500 transition-colors group-hover:text-emerald-300" />{label}</Link>)}</nav></div>
        <div className="mt-auto border-t border-white/10 p-5"><div className="rounded-2xl bg-white/[0.06] p-4"><div className="flex items-center gap-2 text-xs font-medium text-emerald-300"><BarChart3 size={14} /> Pipeline health</div><p className="mt-2 text-xs leading-5 text-slate-400">Keep every property enquiry moving toward its next best action.</p></div></div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur lg:px-10"><div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-sm font-semibold lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-[#07111f]"><Sparkles size={16} /></span>AI Lead Machine</Link><div className="hidden text-sm text-slate-500 lg:block">Real estate sales workspace</div><div className="flex items-center gap-3"><span className="hidden text-xs text-slate-500 sm:block">Demo workspace</span><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#07111f] text-xs font-bold text-white">AM</div></div></div><nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden" aria-label="Mobile workspace navigation">{navigation.map(({ href, label }) => <Link key={href} href={href} className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700">{label}</Link>)}</nav></header>
        <main className="min-h-[calc(100vh-73px)] p-5 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
