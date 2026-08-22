"use client"

import { Suspense, useState } from "react"
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
  const [total] = useState(initialTotal)
  const [error] = useState(initialError)
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    const { deleteLead } = await import("@/lib/actions/leads")
    const result = await deleteLead(id)
    if (result.error) {
      alert(result.error)
    } else {
      setLeads(leads.filter((l: any) => l.id !== id))
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
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Showing {leads.length} of {total} leads</p>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Lead
        </button>
      </div>

      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-gray-100 rounded-lg" /></div>}>
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