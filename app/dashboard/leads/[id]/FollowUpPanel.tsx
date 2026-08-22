"use client"

import { FormEvent, useState } from "react"
import { CalendarClock, Check, LoaderCircle, Plus, X } from "lucide-react"
import { createFollowUp, deleteFollowUp, updateFollowUp } from "@/lib/actions/followups"

type FollowUp = { id: string; scheduledAt: string | Date; channel: string; message: string | null; status: string }

const formatDate = (value: string | Date) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })

export default function FollowUpPanel({ leadId, initialFollowUps }: { leadId: string; initialFollowUps: FollowUp[] }) {
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ scheduledAt: "", channel: "WHATSAPP", message: "" })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    const result = await createFollowUp({ ...form, leadId, channel: form.channel as "WHATSAPP" | "EMAIL" | "SMS" | "CALL" | "OTHER", status: "PENDING" })
    if (result.error || !result.followUp) setError(result.error || "Unable to create follow-up.")
    else {
      setFollowUps((current) => [...current, result.followUp as FollowUp].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()))
      setForm({ scheduledAt: "", channel: "WHATSAPP", message: "" })
      setOpen(false)
    }
    setSaving(false)
  }

  async function markComplete(item: FollowUp) {
    const result = await updateFollowUp(item.id, { status: "COMPLETED" })
    if (result.followUp) setFollowUps((current) => current.map((followUp) => followUp.id === item.id ? { ...followUp, status: "COMPLETED" } : followUp))
  }

  async function cancel(item: FollowUp) {
    const result = await deleteFollowUp(item.id)
    if (result.success) setFollowUps((current) => current.map((followUp) => followUp.id === item.id ? { ...followUp, status: "CANCELLED" } : followUp))
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">Follow-ups</h2><p className="mt-1 text-xs text-slate-500">Keep the next action visible and accountable.</p></div><button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-lg bg-[#07111f] px-2.5 py-2 text-xs font-semibold text-white"><Plus size={14} /> Add</button></div>{open && <form onSubmit={submit} className="mt-4 space-y-3 border-t border-slate-100 pt-4"><label className="block text-xs font-medium text-slate-700">Date and time<input required type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-xs" /></label><div className="grid grid-cols-2 gap-2"><label className="block text-xs font-medium text-slate-700">Channel<select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-xs"><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="CALL">Call</option><option value="SMS">SMS</option><option value="OTHER">Other</option></select></label><label className="block text-xs font-medium text-slate-700">Note<input value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Next action" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-xs" /></label></div>{error && <p className="text-xs text-red-600">{error}</p>}<button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{saving && <LoaderCircle size={13} className="animate-spin" />} Save follow-up</button></form>}<div className="mt-4 space-y-2">{followUps.length === 0 ? <p className="text-xs text-slate-500">No follow-ups scheduled.</p> : followUps.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="flex items-center gap-1 text-xs font-semibold text-slate-900"><CalendarClock size={13} className="text-emerald-600" />{formatDate(item.scheduledAt)}</p><p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{item.channel} · {item.status}</p>{item.message && <p className="mt-2 text-xs text-slate-600">{item.message}</p>}</div>{item.status === "PENDING" && <div className="flex gap-1"><button title="Mark completed" type="button" onClick={() => markComplete(item)} className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-100"><Check size={14} /></button><button title="Cancel" type="button" onClick={() => cancel(item)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200"><X size={14} /></button></div>}</div></div>)}</div></section>
}
