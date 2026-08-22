"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"
import { ArrowLeft, Bot, CalendarDays, CheckCircle2, LoaderCircle, MessageCircle, Send, Sparkles } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import FollowUpPanel from "./FollowUpPanel"

type LeadDetail = any
const money = (value?: number | null) => value ? `₹${(value / 100000).toFixed(0)}L` : "Not captured"

export default function LeadConversation({ lead }: { lead: LeadDetail }) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)
  const [messages, setMessages] = useState(() => lead.conversations?.[0]?.messages || [])
  const extracted = result?.extracted || {
    propertyType: lead.propertyType,
    bedrooms: lead.bedrooms,
    location: lead.location,
    budget: lead.budget,
    timeline: lead.timeline,
    possessionPreference: lead.possessionPreference || lead.possession,
    intent: lead.intent?.toUpperCase(),
  }
  const latestScore = result?.score?.score ?? lead.score ?? lead.leadScores?.[0]?.score ?? 0
  const classification = result?.score?.classification ?? lead.classification ?? lead.leadScores?.[0]?.classification ?? "COLD"
  const scoreReasons = useMemo(() => result?.score?.reasons || (lead.leadScores?.[0]?.reasoning ? JSON.parse(lead.leadScores[0].reasoning) : []), [lead.leadScores, result])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() || isSending) return
    const outgoing = message.trim()
    setMessage("")
    setError("")
    setIsSending(true)
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: lead.id, message: outgoing }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Unable to send message")
      setMessages((current: any[]) => [...current, { id: `user-${Date.now()}`, role: "USER", content: outgoing, createdAt: new Date().toISOString() }, { id: `assistant-${Date.now()}`, role: "ASSISTANT", content: payload.assistantMessage, createdAt: new Date().toISOString() }])
      setResult(payload)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send this message right now.")
    } finally {
      setIsSending(false)
    }
  }

  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/dashboard/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft size={16} /> Back to leads</Link><div className="mt-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><MessageCircle size={20} /></span><div><h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">{lead.name}</h1><p className="mt-1 text-sm text-slate-500">AI qualification workspace · {lead.email || lead.phone || "No contact details"}</p></div></div></div><div className="flex items-center gap-2"><Link href="/dashboard/appointments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"><CalendarDays size={16} /> Schedule appointment</Link><StatusBadge status={lead.status} /></div></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Sparkles size={16} className="text-emerald-600" /> AI conversation</div><p className="mt-1 text-xs text-slate-500">Messages are persisted securely inside your workspace and used to qualify this opportunity.</p></div><div className="min-h-[420px] space-y-4 bg-slate-50/70 p-6">{messages.length ? messages.map((item: any) => <div key={item.id} className={`flex ${item.role === "USER" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "USER" ? "bg-[#07111f] text-white" : "border border-slate-200 bg-white text-slate-700"}`}><div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-60">{item.role === "USER" ? "Customer message" : "AI response"}<span>{new Date(item.createdAt).toLocaleString()}</span></div><p className="whitespace-pre-line">{item.content}</p></div></div>) : <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><Bot size={30} className="text-emerald-600" /><p className="mt-4 text-sm font-semibold text-slate-900">Start the qualification conversation</p><p className="mt-2 max-w-sm text-sm text-slate-500">Send the lead&apos;s message to extract requirements, match live inventory, score intent, and schedule the next best action.</p></div>}</div>{error && <p className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">{error}</p>}<form onSubmit={submit} className="flex gap-3 border-t border-slate-100 bg-white p-4"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a customer message…" disabled={isSending} className="h-12 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" /><button type="submit" disabled={isSending || !message.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#07111f] px-4 text-sm font-semibold text-white disabled:opacity-50">{isSending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />} {isSending ? "Processing" : "Send"}</button></form></section>
      <aside className="space-y-4"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lead score</p><p className="mt-2 text-4xl font-semibold text-slate-950">{latestScore}<span className="text-base text-slate-400">/100</span></p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{classification}</span></div><div className="mt-5 space-y-2">{scoreReasons.length ? scoreReasons.map((reason: string) => <p key={reason} className="flex gap-2 text-xs text-slate-600"><CheckCircle2 size={14} className="shrink-0 text-emerald-600" />{reason}</p>) : <p className="text-xs text-slate-500">Send a message to calculate this lead&apos;s score.</p>}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">AI extracted information</h2><div className="mt-4 space-y-3">{[["Budget", money(extracted.budget)], ["Location", extracted.location || "Not captured"], ["Property", [extracted.bedrooms ? `${extracted.bedrooms}BHK` : null, extracted.propertyType].filter(Boolean).join(" ") || "Not captured"], ["Timeline", extracted.timeline || "Not captured"], ["Intent", extracted.intent || "Not captured"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs last:border-0 last:pb-0"><span className="text-slate-500">{label}</span><span className="text-right font-semibold capitalize text-slate-900">{value}</span></div>)}</div></section>{result?.matches?.length > 0 && <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><h2 className="text-sm font-semibold text-emerald-950">Matched inventory</h2><div className="mt-3 space-y-3">{result.matches.map((property: any) => <div key={property.id} className="rounded-xl bg-white p-3"><p className="text-xs font-semibold text-slate-900">{property.name}</p><p className="mt-1 text-[11px] text-slate-500">{property.location} · {money(property.price)}</p></div>)}</div></section>}<FollowUpPanel leadId={lead.id} initialFollowUps={lead.followUps || []} /></aside></div></div>
}
