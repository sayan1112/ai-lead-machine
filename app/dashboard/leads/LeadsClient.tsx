"use client"

import { Suspense, useRef, useState } from "react"
import { LeadList } from "@/components/leads/LeadList"
import { LeadForm } from "@/components/leads/LeadForm"
import { Lead } from "@prisma/client"

interface LeadsClientProps {
  initialLeads: any[]
  initialTotal: number
  initialError?: string
}

export default function LeadsClient({ initialLeads, initialTotal, initialError }: LeadsClientProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [total, setTotal] = useState(initialTotal)
  const [error] = useState(initialError)
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    setEditingLead(null)
    setShowForm(true)
  }

  const handleEdit = (lead: any) => {
    setEditingLead(lead)
    setShowForm(true)
  }

  const handleView = (lead: any) => {
    window.location.href = `/dashboard/leads/${lead.id}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    const { removeLead } = await import("@/lib/actions/leads")
    const result = await removeLead(id)
    if (result.error) {
      alert(result.error)
    } else {
      setLeads(leads.filter((l: any) => l.id !== id))
      setTotal((count) => Math.max(0, count - 1))
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsImporting(true)
    try {
      const { createLead } = await import("@/lib/actions/leads")
      const rows = (await file.text()).trim().split(/\r?\n/).filter(Boolean)
      const headers = rows.shift()?.split(",").map((header) => header.trim().toLowerCase()) || []
      const imported: Lead[] = []

      for (const row of rows) {
        const values = row.split(",").map((value) => value.trim().replace(/^"|"$/g, ""))
        const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]))
        if (!record.name) continue

        const result = await createLead({
          name: record.name,
          email: record.email || "",
          phone: record.phone || undefined,
          location: record.location || undefined,
          budget: record.budget ? Number(record.budget.replace(/[^0-9]/g, "")) : undefined,
          propertyType: record["property interest"] || record.propertytype || undefined,
          source: record.source || "IMPORT",
          status: record.status || "NEW",
        } as any)
        if (result.lead) imported.push(result.lead)
      }

      if (imported.length) {
        setLeads((current) => [...imported, ...current])
        setTotal((count) => count + imported.length)
      }
      alert(imported.length ? `${imported.length} property enquiries imported.` : "No valid property enquiries were found in that file.")
    } finally {
      setIsImporting(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingLead) {
        const { updateLead } = await import("@/lib/actions/leads")
        const result = await updateLead(editingLead.id, data)
        if (result.error) {
          alert(result.error)
        } else {
          setShowForm(false)
          setLeads(leads.map((l: any) => l.id === editingLead.id ? result.lead : l))
        }
      } else {
        const { createLead } = await import("@/lib/actions/leads")
        const result = await createLead(data)
        if (result.error) {
          alert(result.error)
        } else {
          setShowForm(false)
          setLeads([result.lead, ...leads])
          setTotal((count) => count + 1)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">We couldn&apos;t load your leads right now. {error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Sales pipeline</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Leads</h1><p className="mt-2 text-sm text-slate-500">Manage, qualify, and convert every property enquiry from one place.</p></div>
        <div className="flex flex-wrap gap-2"><input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} /><button onClick={() => importInputRef.current?.click()} disabled={isImporting} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60">{isImporting ? "Importing..." : "Import Leads"}</button><button onClick={handleCreate} className="rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#10243a]">+ Add Lead</button></div>
      </div>

      <p className="mb-4 text-sm text-slate-500">Showing {leads.length} of {total} property enquiries</p>
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 rounded-lg bg-gray-100" /></div>}>
        <LeadList leads={leads} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
      </Suspense>

      {showForm && (
        <LeadForm
          lead={editingLead}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingLead(null)
          }}
          isLoading={isSubmitting}
        />
      )}
    </>
  )
}
