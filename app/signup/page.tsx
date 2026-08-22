"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles, TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", organizationName: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true)
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Unable to create workspace")
      router.replace(`/login?created=1`)
    } catch (signupError) { setError(signupError instanceof Error ? signupError.message : "Unable to create your workspace right now.") } finally { setLoading(false) }
  }
  return <main className="min-h-screen bg-[#07111f] px-6 py-6 text-white"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col"><header className="flex items-center justify-between"><Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f]"><Sparkles size={19} /></span>AI Lead Machine</Link><Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15} /> Sign in</Link></header><div className="flex flex-1 items-center justify-center py-14"><section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/30"><div className="rounded-[21px] bg-[#f8fafc] px-6 py-8 text-slate-900 sm:px-9 sm:py-10"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Start your workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Create your workspace.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Bring your leads, inventory, and follow-up workflow together.</p>{error && <div role="alert" className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"><TriangleAlert size={17} className="mt-0.5 shrink-0" />{error}</div>}<form onSubmit={submit} className="mt-7 space-y-4">{[["name", "Your name", "Arjun Malhotra", "text"], ["organizationName", "Workspace name", "Acme Realty", "text"], ["email", "Work email", "you@company.com", "email"], ["password", "Password", "At least 8 characters, with a letter and number", "password"]].map(([name, label, placeholder, type]) => <label key={name} className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} placeholder={placeholder} value={form[name as keyof typeof form]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} required minLength={name === "password" ? 8 : undefined} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" /></label>)}<button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] text-sm font-semibold text-white disabled:opacity-60">{loading ? <><LoaderCircle size={17} className="animate-spin" />Creating workspace...</> : <>Create workspace <ArrowRight size={17} /></>}</button></form></div></section></div></div></main>
}
