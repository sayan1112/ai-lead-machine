"use client"

import { Suspense, useState, useEffect } from "react"
import { StatusBadge } from "@/components/ui/StatusBadge"

interface AppointmentsClientProps {
  initialAppointments: any[]
  initialTotal: number
  initialError?: string
  initialUpcoming: any[]
}

export default function AppointmentsClient({ initialAppointments, initialTotal, initialError, initialUpcoming }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [total] = useState(initialTotal)
  const [error] = useState(initialError)
  const [upcoming] = useState(initialUpcoming)
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = () => {
    setEditingAppointment(null)
    setShowForm(true)
  }

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return
    const { deleteAppointment } = await import("@/lib/actions/appointments")
    const result = await deleteAppointment(id)
    if (result.error) {
      alert(result.error)
    } else {
      setAppointments(appointments.filter(a => a.id !== id))
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingAppointment) {
        const { updateAppointment } = await import("@/lib/actions/appointments")
        const result = await updateAppointment(editingAppointment.id, data)
        if (result.error) {
          alert(result.error)
        } else {
          setShowForm(false)
          setAppointments(appointments.map(a => a.id === editingAppointment.id ? result.appointment : a))
        }
      } else {
        const { createAppointment } = await import("@/lib/actions/appointments")
        const result = await createAppointment(data)
        if (result.error) {
          alert(result.error)
        } else {
          setShowForm(false)
          setAppointments([result.appointment, ...appointments])
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
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Client activity</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Appointments</h1><p className="mt-2 text-sm text-slate-500">Keep property visits, calls, and client meetings organized.</p></div>
        <button onClick={handleCreate} className="w-fit rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#10243a]">+ Schedule Appointment</button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 text-xs font-medium text-slate-600"><span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Property Visit</span><span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Client Call</span><span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Site Visit</span><span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Consultation</span><span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Follow-Up Meeting</span></div>
      {/* Upcoming Appointments */}
      {upcoming.length > 0 && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h3 className="mb-3 font-semibold text-emerald-950">Upcoming This Week</h3>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                <p className="font-medium text-slate-900">{apt.lead.name}</p>
                <p className="text-sm text-slate-500">
                    {new Date(apt.date).toLocaleString()} • {apt.duration} min
                  </p>
                </div>
                <StatusBadge status={apt.status} variant="appointment" />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mb-4 text-sm text-slate-500">Showing {appointments.length} of {total} scheduled activities</p>

      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-gray-100 rounded-lg" /></div>}>
        <AppointmentsTable appointments={appointments} onEdit={handleEdit} onDelete={handleDelete} />
      </Suspense>

      {showForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingAppointment(null)
          }}
          isLoading={isSubmitting}
        />
      )}
    </>
  )
}

function AppointmentsTable({ appointments, onEdit, onDelete }: { appointments: any[]; onEdit: (a: any) => void; onDelete: (id: string) => void }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments yet</h3>
        <p className="mt-1 text-sm text-gray-500">Schedule a property visit, consultation, or follow-up to keep opportunities moving.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{apt.lead.name}</div>
                  <div className="text-sm text-gray-500">{apt.lead.email || apt.lead.phone}</div>
                </td>
                <td className="px-6 py-4">
                  {apt.property ? (
                    <div className="text-sm text-gray-900">{apt.property.name}</div>
                  ) : (
                    <span className="text-sm text-gray-400">Not linked</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{new Date(apt.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{apt.duration} min</td>
                <td className="px-6 py-4">
                  <StatusBadge status={apt.status} variant="appointment" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{apt.assignedTo?.name || "Unassigned"}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(apt)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                    <button onClick={() => onDelete(apt.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AppointmentForm({ appointment, onSubmit, onCancel, isLoading = false }: any) {
  const [formData, setFormData] = useState({
    leadId: "",
    propertyId: "",
    date: "",
    duration: 60,
    notes: "",
    status: "SCHEDULED",
  })
  const [leads, setLeads] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    // Fetch leads and properties
    fetch("/api/leads").then(r => r.json()).then(d => setLeads(d.leads || []))
    fetch("/api/properties").then(r => r.json()).then(d => setProperties(d.properties || []))

    if (appointment) {
      setFormData({
        leadId: appointment.leadId,
        propertyId: appointment.propertyId || "",
        date: new Date(appointment.date).toISOString().slice(0, 16),
        duration: appointment.duration,
        notes: appointment.notes || "",
        status: appointment.status,
      })
    }
  }, [appointment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: name === "duration" ? Number(value) : value }))
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {appointment ? "Edit Appointment" : "Schedule Appointment"}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prospect *</label>
                <select name="leadId" value={formData.leadId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select lead...</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.email || l.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property listing</label>
                <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">None</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.location}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleChange} min={15} max={480} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Add the appointment type, client requirements, or preparation notes" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {appointment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? "Saving..." : appointment ? "Update" : "Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
