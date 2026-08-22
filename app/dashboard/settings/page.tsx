import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Bell, Bot, Building2, SlidersHorizontal, UserRound } from "lucide-react";

export const metadata = {
  title: "Settings | AI Lead Machine",
  description: "Manage your AI Lead Machine workspace and preferences.",
};

const sections = [
  { icon: Building2, title: "Workspace", copy: "Manage your organization and workspace preferences.", value: "AI Lead Machine Demo Workspace" },
  { icon: UserRound, title: "Profile", copy: "Update your personal information and account preferences.", value: "Workspace administrator" },
  { icon: Bell, title: "Notifications", copy: "Choose how you receive lead, appointment, and follow-up notifications.", value: "Email and in-app alerts" },
  { icon: SlidersHorizontal, title: "Lead Management", copy: "Configure lead statuses, sources, and assignment preferences.", value: "Pipeline defaults" },
  { icon: Bot, title: "AI Settings", copy: "Configure how AI-assisted lead qualification and follow-up works.", value: "Qualification assistance enabled" },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Workspace preferences</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Settings</h1><p className="mt-2 text-sm text-slate-500">Manage your AI Lead Machine workspace and preferences.</p></div>
      <div className="grid gap-4 md:grid-cols-2">{sections.map(({ icon: Icon, title, copy, value }) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={19} /></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Workspace setting</span></div><h2 className="mt-5 text-base font-semibold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p><div className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">{value}</div></section>)}</div>
    </div>
  );
}
