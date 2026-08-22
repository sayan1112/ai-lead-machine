"use client"

import { useState, useEffect } from "react"
import { Lead } from "@prisma/client"

interface LeadFormProps {
  lead?: (Lead & {
    assignedTo?: { id: string; name: string } | null
  }) | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const SOURCES = ["WEBSITE", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "GOOGLE_ADS", "PROPERTY_PORTAL", "REFERRAL", "DIRECT_ENQUIRY", "MANUAL", "IMPORT", "OTHER"]
const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT", "NEGOTIATION", "WON", "LOST"]
const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial"]
const TIMELINES = ["3 months", "6 months", "1 year", "flexible"]
const POSSESSIONS = ["Ready to move", "Under construction"]
const INTENTS = ["high", "medium", "low"]
const labelFor = (value: string) => value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")

export function LeadForm({ lead, onSubmit, onCancel, isLoading = false }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "MANUAL" as any,
    status: "NEW" as any,
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    budget: "",
    location: "",
    timeline: "",
    possession: "",
    intent: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source,
        status: lead.status,
        propertyType: lead.propertyType || "",
        bedrooms: lead.bedrooms?.toString() || "",
        bathrooms: lead.bathrooms?.toString() || "",
        budget: lead.budget?.toString() || "",
        location: lead.location || "",
        timeline: lead.timeline || "",
        possession: lead.possession || "",
        intent: lead.intent || "",
        notes: lead.notes || "",
      })
    }
  }, [lead])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Lead name is required."
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address (for example, name@company.com)."
    }
    if (formData.budget && (!Number.isFinite(Number(formData.budget)) || Number(formData.budget) < 0)) {
      newErrors.budget = "Enter a budget of 0 or more using numbers only."
    }
    if (formData.bedrooms && (!Number.isInteger(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0)) {
      newErrors.bedrooms = "Bedrooms must be a whole number of 0 or more."
    }
    if (formData.bathrooms && (!Number.isInteger(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0)) {
      newErrors.bathrooms = "Bathrooms must be a whole number of 0 or more."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const submitData = {
      ...formData,
      email: formData.email || null,
      phone: formData.phone || null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      budget: formData.budget ? Number(formData.budget) : undefined,
      propertyType: formData.propertyType || undefined,
      location: formData.location || undefined,
      timeline: formData.timeline || undefined,
      possession: formData.possession || undefined,
      intent: formData.intent || undefined,
      notes: formData.notes || undefined,
    }

    await onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {lead ? "Edit Lead" : "Create New Lead"}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {Object.keys(errors).length > 0 && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert"><p className="font-medium">Please fix the highlighted fields before saving.</p><ul className="mt-1 list-inside list-disc text-xs">{Object.entries(errors).filter(([, message]) => message).map(([field, message]) => <li key={field}>{message}</li>)}</ul></div>}
            {/* Basic Info */}
            <div className="border-b pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{labelFor(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{labelFor(s)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Requirements */}
            <div className="border-b pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Property Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bedrooms ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bathrooms ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.budget ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {TIMELINES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Possession</label>
                  <select
                    name="possession"
                    value={formData.possession}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {POSSESSIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intent</label>
                  <select
                    name="intent"
                    value={formData.intent}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {INTENTS.map((i) => (
                      <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : lead ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
