import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  Check,
  Inbox,
  MessageCircle,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Lead Machine | Turn Real Estate Leads Into Closings",
  description:
    "AI Lead Machine helps real estate teams capture, qualify, follow up with, and convert property leads from one intelligent platform.",
};

const solutionCards = [
  { icon: Inbox, title: "Lead Capture", copy: "Bring property enquiries into one centralized lead pipeline." },
  { icon: Bot, title: "AI Qualification", copy: "Identify serious buyers and sellers faster with intelligent lead qualification." },
  { icon: MessageCircle, title: "Smart Follow-Up", copy: "Keep prospects engaged with timely, consistent follow-ups." },
  { icon: CalendarDays, title: "Appointment Management", copy: "Schedule property visits, calls, and meetings without losing track." },
  { icon: Building2, title: "Property Management", copy: "Keep your property inventory organized and connected to the right leads." },
  { icon: BarChart3, title: "Conversion Analytics", copy: "Understand where your leads come from and where opportunities are being won or lost." },
];

const workflow = [
  ["01", "Capture", "Collect leads from your marketing and enquiry channels."],
  ["02", "Qualify", "Identify the prospects most likely to become customers."],
  ["03", "Follow Up", "Keep every opportunity moving with organized follow-ups."],
  ["04", "Convert", "Turn qualified prospects into appointments, property visits, and deals."],
];

const audiences = [
  ["Agent", "Manage your personal pipeline and spend less time chasing spreadsheets."],
  ["Broker", "Give your team one place to manage leads and opportunities."],
  ["Agency", "Centralize your sales pipeline and understand team performance."],
  ["Property Consultant", "Stay on top of enquiries, appointments, and property requirements."],
];

const benefits = [
  "Centralized lead management",
  "Faster response times",
  "Better lead qualification",
  "Organized follow-ups",
  "Appointment tracking",
  "Property management",
  "Sales pipeline visibility",
  "Conversion analytics",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[820px] bg-[radial-gradient(circle_at_50%_-10%,rgba(52,211,153,0.18),transparent_58%)]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="AI Lead Machine home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f] shadow-[0_0_28px_rgba(52,211,153,0.28)]">
            <Sparkles size={19} strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight sm:text-base">AI Lead Machine</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex" aria-label="Main navigation">
          <a className="transition-colors hover:text-white" href="#problem">Why it matters</a>
          <a className="transition-colors hover:text-white" href="#solution">Platform</a>
          <a className="transition-colors hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-white" href="#who-its-for">Who it is for</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden px-3 py-2 text-sm text-slate-300 transition-colors hover:text-white sm:block">Sign in</Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#07111f] transition-transform hover:-translate-y-0.5 hover:bg-emerald-100">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
        <div className="max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-2 text-xs font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
            AI-powered real estate growth
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance sm:text-6xl lg:text-[68px]">
            Turn More Real Estate Leads Into Closings.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300 sm:text-xl">
            AI Lead Machine helps real estate teams capture, qualify, follow up with, and convert property leads from one intelligent platform.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07111f] transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_10px_35px_rgba(52,211,153,0.2)]">
              Get Started <ArrowRight size={17} />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5">
              <Play size={15} fill="currentColor" /> See How It Works
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-400">Built for agents, brokers, property consultants, and real estate teams.</p>
        </div>

        <div className="relative lg:pl-4">
          <div className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative rounded-[26px] border border-white/10 bg-[#0c1b2e]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur sm:p-4">
            <div className="rounded-[19px] border border-slate-200 bg-[#f8fafc] p-4 text-slate-900 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Demo workspace</p><p className="mt-1 text-lg font-semibold tracking-tight">Sales Overview</p></div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">AM</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["Total leads", "1,248"], ["Qualified", "684"], ["Appointments", "186"], ["Conversion", "14.8%"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">{label}</p><p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{value}</p><p className="mt-1 text-[10px] font-semibold text-emerald-600">Demo data</p></div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold">Lead pipeline</p><span className="text-[11px] text-slate-400">This month</span></div>
                  <div className="mt-6 space-y-4">{[["New", "128", "bg-sky-400"], ["Qualified", "684", "bg-violet-400"], ["Appointment", "186", "bg-amber-400"], ["Won", "42", "bg-emerald-400"]].map(([label, value, color], index) => <div key={label}><div className="mb-1.5 flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-slate-500"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span><span className="font-semibold text-slate-700">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${100 - index * 17}%` }} /></div></div>)}</div>
                </div>
                <div className="rounded-xl bg-[#10243a] p-4 text-white"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Next best actions</p><Target size={15} className="text-emerald-300" /></div><p className="mt-5 text-3xl font-semibold tracking-tight">8</p><p className="mt-1 text-xs text-slate-400">high-intent leads ready for follow-up</p><div className="mt-7 space-y-2 text-xs text-slate-300"><p className="rounded-lg bg-white/5 px-3 py-2">Confirm Aarav&apos;s property visit</p><p className="rounded-lg bg-white/5 px-3 py-2">Share Kharadi shortlist with Priya</p></div></div>
              </div>
              <p className="mt-4 text-center text-[10px] text-slate-400">Illustrative demo workspace data — not company performance claims.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:px-8 lg:py-24">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">The cost of disconnected tools</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your Leads Shouldn&apos;t Go Cold.</h2></div>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">Real estate teams lose valuable opportunities when leads are scattered across spreadsheets, WhatsApp conversations, forms, and disconnected tools. AI Lead Machine brings your leads, follow-ups, appointments, and properties into one place.</p>
        </div>
      </section>

      <section id="solution" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">The platform</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">One System For Your Entire Lead Pipeline.</h2></div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{solutionCards.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.06]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><Icon size={21} /></div><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div>
      </section>

      <section id="how-it-works" className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-24"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">A simpler workflow</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">From Lead To Closing, Without The Chaos.</h2></div><div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">{workflow.map(([number, title, copy]) => <div key={number}><p className="text-sm font-semibold text-emerald-300">{number}</p><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></div>)}</div></div>
      </section>

      <section id="who-its-for" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Made for your team</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Built For Modern Real Estate Teams.</h2></div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([title, copy], index) => <article key={title} className="rounded-2xl border border-white/10 bg-[#0c1b2e] p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">{index === 0 ? <Users size={19} /> : index === 1 ? <Building2 size={19} /> : index === 2 ? <BarChart3 size={19} /> : <Target size={19} />}</div><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]"><div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:py-24"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Built to move revenue forward</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Spend Less Time Managing Leads. More Time Closing Deals.</h2></div><div className="grid gap-4 sm:grid-cols-2">{benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 text-sm text-slate-300"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300"><Check size={13} strokeWidth={3} /></span>{benefit}</div>)}</div></div></section>

      <section className="relative mx-6 my-10 overflow-hidden rounded-3xl border border-emerald-300/20 bg-emerald-300 px-6 py-12 text-[#07111f] sm:px-12 lg:mx-auto lg:max-w-7xl lg:py-14"><div className="absolute -right-10 -top-28 h-72 w-72 rounded-full bg-white/20 blur-3xl" /><div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div className="max-w-xl"><h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Ready To Build A Better Real Estate Pipeline?</h2><p className="mt-3 text-sm leading-6 text-[#164e43] sm:text-base">Stop letting valuable property leads disappear. Bring your lead generation and sales workflow into one intelligent platform.</p></div><Link href="/login" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#07111f] px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Start Using AI Lead Machine <ArrowRight size={17} /></Link></div></section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {new Date().getFullYear()} AI Lead Machine · Turn Real Estate Leads Into Closings.</p><div className="flex gap-5"><Link className="transition-colors hover:text-slate-300" href="/login">Sign in</Link><Link className="transition-colors hover:text-slate-300" href="/dashboard">Workspace</Link></div></footer>
    </main>
  );
}
