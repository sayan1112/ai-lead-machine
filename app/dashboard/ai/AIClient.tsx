"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarPlus, CheckCircle2, Loader2, Mail, MessageSquareText, Search, Sparkles, UserRound } from "lucide-react"

type LeadOption = { id: string; name: string; email: string | null; phone: string | null; status: string; score: number; classification: string; propertyType: string | null; bedrooms: number | null; budget: number | null; location: string | null; timeline: string | null }
type Feedback = { type: "error" | "success"; text: string } | null

const money = (value: number | null | undefined) => value ? `₹${(value / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L` : "Not captured"
const label = (value: string | null | undefined) => value ? value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not captured"
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"

export default function AIClient({ initialLeads, initialError }: { initialLeads: LeadOption[]; initialError?: string }) {
  const [leads] = useState(initialLeads)
  const [selectedId, setSelectedId] = useState(initialLeads[0]?.id || "")
  const [lead, setLead] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState("")
  const [feedback, setFeedback] = useState<Feedback>(initialError ? { type: "error", text: initialError } : null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showAppointment, setShowAppointment] = useState(false)
  const [followUp, setFollowUp] = useState({ scheduledAt: "", channel: "WHATSAPP", message: "" })
  const [appointment, setAppointment] = useState({ date: "", propertyId: "", duration: 60, notes: "" })

  useEffect(() => {
    if (!selectedId) return
    let active = true
    setBusy("lead")
    import("@/lib/actions/ai-assistant").then(({ getAssistantLead }) => getAssistantLead(selectedId)).then((result) => {
      if (!active) return
      if (result.error || !result.lead) setFeedback({ type: "error", text: result.error || "Unable to load this lead." })
      else setLead(result.lead)
    }).catch(() => active && setFeedback({ type: "error", text: "Unable to load the selected lead." })).finally(() => active && setBusy(""))
    return () => { active = false }
  }, [selectedId])

  const selectedOption = useMemo(() => leads.find((item) => item.id === selectedId), [leads, selectedId])
  const run = async (key: string, action: () => Promise<any>, success?: string) => {
    setBusy(key); setFeedback(null)
    try {
      const result = await action()
      if (result.error) setFeedback({ type: "error", text: result.error })
      else { if (success) setFeedback({ type: "success", text: success }); return result }
    } catch { setFeedback({ type: "error", text: "This action could not be completed. Please try again." }) }
    finally { setBusy("") }
    return null
  }

  const analyze = async () => {
    const result = await run("analyze", () => import("@/lib/actions/ai-assistant").then(({ analyzeLead }) => analyzeLead(selectedId)), "Lead analysis saved to the workspace.")
    if (result) { setAnalysis(result.analysis); setMatches(result.matches || []); setBusy("") }
  }
  const generateReply = async () => {
    const result = await run("reply", () => import("@/lib/actions/ai-assistant").then(({ generateSalesReply }) => generateSalesReply(selectedId)), "Sales reply generated from the lead and inventory.")
    if (result) { setReply(result.reply || ""); setMatches(result.matches || []); setBusy("") }
  }
  const findMatches = async () => {
    const result = await run("matches", () => import("@/lib/actions/ai-assistant").then(({ findMatchingProperties }) => findMatchingProperties(selectedId)), "Matching properties loaded from your inventory.")
    if (result) { setMatches(result.properties || []); setBusy("") }
  }
  const submitFollowUp = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await run("follow-up", () => import("@/lib/actions/ai-assistant").then(({ createAssistantFollowUp }) => createAssistantFollowUp({ leadId: selectedId, ...followUp } as any)), "Follow-up scheduled.")
    if (result) { setShowFollowUp(false); setFollowUp({ scheduledAt: "", channel: "WHATSAPP", message: "" }) }
  }
  const submitAppointment = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await run("appointment", () => import("@/lib/actions/ai-assistant").then(({ createAssistantAppointment }) => createAssistantAppointment({ leadId: selectedId, ...appointment })), "Appointment scheduled.")
    if (result) { setShowAppointment(false); setAppointment({ date: "", propertyId: "", duration: 60, notes: "" }) }
  }

  if (!initialError && !leads.length) return <EmptyState text="Add a lead to start using the AI workspace." link="/dashboard/leads" />
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Intelligence layer</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">AI Assistant</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Use verified lead context and your live inventory to decide what to do next.</p></div><Link href="/dashboard/leads" className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700">Manage leads</Link></header>
    {feedback && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role="status">{feedback.type === "success" && <CheckCircle2 size={16} />}{feedback.text}</div>}
    <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Search size={17} className="text-emerald-600" />Choose a lead</div><select className={inputClass} value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setAnalysis(null); setReply(""); setMatches([]); setFeedback(null) }} aria-label="Choose a lead for analysis">{leads.map((item) => <option key={item.id} value={item.id}>{item.name} · {label(item.classification)} · {item.score}/100</option>)}</select>{busy === "lead" && <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Loader2 size={13} className="animate-spin" />Loading lead context…</p>}{lead && <div className="mt-5 space-y-3 border-t border-slate-100 pt-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserRound size={17} /></span><div><p className="font-semibold text-slate-900">{lead.name}</p><p className="text-xs text-slate-500">{lead.email || lead.phone || "No contact details"}</p></div></div><div className="grid grid-cols-2 gap-2 text-xs"><Fact title="Status" value={label(lead.status)} /><Fact title="Score" value={`${lead.score}/100 · ${label(lead.classification)}`} /><Fact title="Property" value={lead.propertyType || "Not captured"} /><Fact title="Bedrooms" value={lead.bedrooms?.toString() || "Not captured"} /><Fact title="Budget" value={money(lead.budget)} /><Fact title="Location" value={lead.location || "Not captured"} /><Fact title="Timeline" value={lead.timeline || "Not captured"} /><Fact title="Intent" value={lead.intent || "Not captured"} /></div>{lead.notes && <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Notes:</span> {lead.notes}</div>}</div>}</article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles size={17} className="text-emerald-600" />Next best actions</div><p className="mt-1 text-xs text-slate-500">Every action uses this workspace&apos;s real lead and property data.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Server-side AI</span></div><div className="mt-5 grid gap-2 sm:grid-cols-2"><ActionButton onClick={analyze} busy={busy === "analyze"} icon={<Sparkles size={15} />}>Analyze Lead</ActionButton><ActionButton onClick={generateReply} busy={busy === "reply"} icon={<Mail size={15} />}>Generate Sales Reply</ActionButton><ActionButton onClick={findMatches} busy={busy === "matches"} icon={<Search size={15} />}>Find Matching Properties</ActionButton><ActionButton onClick={() => setShowFollowUp(true)} icon={<MessageSquareText size={15} />}>Create Follow-up</ActionButton><ActionButton onClick={() => setShowAppointment(true)} icon={<CalendarPlus size={15} />}>Schedule Appointment</ActionButton></div>{analysis && <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-sm font-semibold text-emerald-950">Qualification analysis</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><Fact title="Intent" value={analysis.buyingSellingIntent || label(analysis.intent)} /><Fact title="Urgency" value={analysis.urgency || "Unclear"} /><Fact title="Property type" value={analysis.propertyType || "Not captured"} /><Fact title="Timeline" value={analysis.timeline || "Not captured"} /></div><p className="mt-4 text-sm leading-6 text-slate-700">{analysis.qualificationSummary}</p><p className="mt-2 text-sm font-semibold text-emerald-800">Next: {analysis.recommendedNextAction}</p></div>}{reply && <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Suggested sales reply</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply}</p></div>}</article>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-950">Matched inventory</h2><p className="mt-1 text-xs text-slate-500">Ranked from available properties in your workspace.</p></div><span className="text-xs text-slate-400">{matches.length} result{matches.length === 1 ? "" : "s"}</span></div>{matches.length ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{matches.map((property) => <div key={property.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-2"><p className="font-semibold text-slate-900">{property.name}</p><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{property.relevance}%</span></div><p className="mt-2 text-xs text-slate-500">{property.type} · {property.location}</p><p className="mt-3 text-sm font-semibold text-slate-800">{money(property.price)}</p><p className="mt-1 text-xs text-slate-500">{property.bedrooms ? `${property.bedrooms} bedrooms` : "Flexible layout"} · {property.availableUnits} available</p></div>)}</div> : <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Run property matching to see ranked available inventory.</div>}</section>
    {showFollowUp && <Modal title="Create follow-up" onClose={() => setShowFollowUp(false)}><form onSubmit={submitFollowUp} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Date and time<input required type="datetime-local" className={inputClass} value={followUp.scheduledAt} onChange={(e) => setFollowUp({ ...followUp, scheduledAt: e.target.value })} /></label><label className="block text-sm font-medium text-slate-700">Channel<select className={inputClass} value={followUp.channel} onChange={(e) => setFollowUp({ ...followUp, channel: e.target.value })}><option>WHATSAPP</option><option>EMAIL</option><option>SMS</option><option>CALL</option><option>OTHER</option></select></label><label className="block text-sm font-medium text-slate-700">Message<textarea className={inputClass} rows={3} value={followUp.message} onChange={(e) => setFollowUp({ ...followUp, message: e.target.value })} placeholder="What should the team follow up about?" /></label><SubmitButton busy={busy === "follow-up"}>Schedule follow-up</SubmitButton></form></Modal>}
    {showAppointment && <Modal title="Schedule appointment" onClose={() => setShowAppointment(false)}><form onSubmit={submitAppointment} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Date and time<input required type="datetime-local" className={inputClass} value={appointment.date} onChange={(e) => setAppointment({ ...appointment, date: e.target.value })} /></label><label className="block text-sm font-medium text-slate-700">Property<select className={inputClass} value={appointment.propertyId} onChange={(e) => setAppointment({ ...appointment, propertyId: e.target.value })}><option value="">Client consultation</option>{matches.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Duration<select className={inputClass} value={appointment.duration} onChange={(e) => setAppointment({ ...appointment, duration: Number(e.target.value) })}><option value={30}>30 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>2 hours</option></select></label><label className="block text-sm font-medium text-slate-700">Notes<textarea className={inputClass} rows={3} value={appointment.notes} onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })} /></label><SubmitButton busy={busy === "appointment"}>Schedule appointment</SubmitButton></form></Modal>}
  </div>
}

function Fact({ title, value }: { title: string; value: string }) { return <div className="rounded-lg bg-white/80 p-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-1 truncate text-xs font-medium text-slate-700" title={value}>{value}</p></div> }
function ActionButton({ children, onClick, busy, icon }: { children: React.ReactNode; onClick: () => void; busy?: boolean; icon: React.ReactNode }) { return <button type="button" onClick={onClick} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : icon}{busy ? "Working…" : children}</button> }
function SubmitButton({ children, busy }: { children: React.ReactNode; busy?: boolean }) { return <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#10243a] disabled:opacity-60">{busy && <Loader2 size={15} className="animate-spin" />}{busy ? "Saving…" : children}</button> }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">{title}</h2><button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-700">Close</button></div><div className="mt-5">{children}</div></div></div> }
function EmptyState({ text, link }: { text: string; link: string }) { return <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Sparkles className="mx-auto text-emerald-600" size={25} /><p className="mt-3 text-sm text-slate-600">{text}</p><Link href={link} className="mt-5 inline-flex rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white">Go to leads</Link></div> }
