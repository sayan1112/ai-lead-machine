import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  MessageCircle,
  Play,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Lead Machine | Turn inquiries into opportunities",
  description:
    "The intelligent lead workspace for real estate teams that want to respond faster and close more deals.",
};

const features = [
  {
    icon: Bot,
    title: "AI lead qualification",
    description:
      "Prioritize the people most likely to buy with clear scores, intent signals, and next steps.",
  },
  {
    icon: MessageCircle,
    title: "Every conversation, together",
    description:
      "Keep messages, notes, contact details, and activity history in one focused workspace.",
  },
  {
    icon: BarChart3,
    title: "A pipeline that moves",
    description:
      "See what is working across sources and turn your best follow-up habits into a repeatable system.",
  },
];

const pipeline = [
  { label: "New inquiries", value: "128", color: "bg-sky-400" },
  { label: "Qualified", value: "64", color: "bg-violet-400" },
  { label: "Appointments", value: "32", color: "bg-amber-400" },
  { label: "Converted", value: "18", color: "bg-emerald-400" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_50%_-10%,rgba(52,211,153,0.16),transparent_55%)]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="AI Lead Machine home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f] shadow-[0_0_28px_rgba(52,211,153,0.28)]">
            <Sparkles size={19} strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight sm:text-base">
            AI Lead Machine
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex" aria-label="Main navigation">
          <a className="transition-colors hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-white" href="#features">Features</a>
          <a className="transition-colors hover:text-white" href="#results">Results</a>
        </nav>

        <div className="flex items-center gap-3">
          <a className="hidden px-3 py-2 text-sm text-slate-300 transition-colors hover:text-white sm:block" href="/login">Sign in</a>
          <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#07111f] transition-transform hover:-translate-y-0.5 hover:bg-emerald-100" href="/login">
            Get started <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
        <div className="max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-2 text-xs font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
            Built for ambitious real estate teams
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance sm:text-6xl lg:text-[70px]">
            Turn every inquiry into an opportunity.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300 sm:text-xl">
            AI Lead Machine brings your leads, follow-ups, and property pipeline into one calm, intelligent workspace.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07111f] transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_10px_35px_rgba(52,211,153,0.2)]" href="/login">
              Start managing leads <ArrowRight size={17} />
            </a>
            <a className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5" href="#how-it-works">
              <Play size={15} fill="currentColor" /> See how it works
            </a>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-300" /> No credit card required</span>
            <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-300" /> Set up in minutes</span>
          </div>
        </div>

        <div id="results" className="relative lg:pl-4">
          <div className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative rounded-[26px] border border-white/10 bg-[#0c1b2e]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur sm:p-4">
            <div className="rounded-[19px] border border-slate-200 bg-[#f8fafc] p-4 text-slate-900 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Overview</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">Good morning, Alex</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">AC</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Total leads", "1,284", "+18.2%"],
                  ["Qualified", "486", "+12.4%"],
                  ["Appointments", "164", "+8.7%"],
                  ["Conversion", "12.8%", "+2.1%"],
                ].map(([label, value, change]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">{label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold text-emerald-600">{change}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Lead pipeline</p>
                    <span className="text-[11px] text-slate-400">This month</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {pipeline.map((item, index) => (
                      <div key={item.label}>
                        <div className="mb-1.5 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-2 text-slate-500"><span className={`h-2 w-2 rounded-full ${item.color}`} />{item.label}</span>
                          <span className="font-semibold text-slate-700">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${item.color}`} style={{ width: `${100 - index * 17}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-[#10243a] p-4 text-white">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold">AI insights</p><Sparkles size={15} className="text-emerald-300" /></div>
                  <p className="mt-5 text-3xl font-semibold tracking-tight">+24.6%</p>
                  <p className="mt-1 text-xs text-slate-400">more follow-ups completed</p>
                  <div className="mt-8 flex h-12 items-end gap-1.5">{[28, 40, 33, 58, 48, 76, 68, 94].map((height, index) => <div key={index} className="flex-1 rounded-t bg-emerald-300/80" style={{ height: `${height}%` }} />)}</div>
                  <p className="mt-2 text-[10px] text-slate-500">Last 8 weeks</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-emerald-800"><Sparkles size={15} /></div><p className="text-xs font-medium text-emerald-900">You have 8 high-intent leads ready for follow-up.</p></div>
                <ChevronRight size={16} className="hidden text-emerald-700 sm:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 sm:grid-cols-3 sm:gap-8 lg:px-8 lg:py-20">
          {[
            ["01", "Connect your sources", "Bring in inquiries from your website, ads, social channels, or manual entry."],
            ["02", "Let AI find the signal", "Automatic scoring helps your team know who to contact first and why."],
            ["03", "Close with confidence", "Track every next step from first message to appointment and conversion."],
          ].map(([number, title, description]) => (
            <div key={number} className="relative"><p className="text-sm font-semibold text-emerald-300">{number}</p><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{description}</p></div>
          ))}
        </div>
      </section>

      <section id="features" className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">One powerful workspace</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Less chasing. More meaningful conversations.</h2></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.06]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><Icon size={21} /></div><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></article>
          ))}
        </div>
      </section>

      <section className="relative mx-6 mb-10 overflow-hidden rounded-3xl border border-emerald-300/20 bg-emerald-300 px-6 py-12 text-[#07111f] sm:px-12 lg:mx-auto lg:max-w-7xl lg:py-14">
        <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div className="max-w-xl"><h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your next great lead is already waiting.</h2><p className="mt-3 text-sm leading-6 text-[#164e43] sm:text-base">Give your team the context and clarity to move faster, every day.</p></div><a className="inline-flex w-fit items-center gap-2 rounded-full bg-[#07111f] px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5" href="/login">Open your workspace <ArrowRight size={17} /></a></div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {new Date().getFullYear()} AI Lead Machine</p><div className="flex gap-5"><a className="transition-colors hover:text-slate-300" href="/login">Sign in</a><a className="transition-colors hover:text-slate-300" href="/dashboard">Dashboard</a></div></footer>
    </main>
  );
}
