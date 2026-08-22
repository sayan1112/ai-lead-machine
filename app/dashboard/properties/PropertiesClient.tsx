"use client"

import { Suspense, useState, useEffect } from "react"
import { StatusBadge } from "@/components/ui/StatusBadge"

interface PropertiesClientProps {
  initialProperties: any[]
  initialTotal: number
  initialError?: string
}

export default function PropertiesClient({ initialProperties, initialTotal, initialError }: PropertiesClientProps) {
  const [properties, setProperties] = useState(initialProperties)
  const [total] = useState(initialTotal)
  const [error] = useState(initialError)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(initialError ? { type: "error", text: initialError } : null)

  const handleCreate = () => {
    setEditingProperty(null)
    setShowForm(true)
  }

  const handleEdit = (property: any) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return
    const { deleteProperty } = await import("@/lib/actions/properties")
    const result = await deleteProperty(id)
    if (result.error) {
      setFeedback({ type: "error", text: result.error })
    } else {
      setProperties(properties.filter((p: any) => p.id !== id))
      setFeedback({ type: "success", text: "Property removed from your inventory." })
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingProperty) {
        const { updateProperty } = await import("@/lib/actions/properties")
        const result = await updateProperty(editingProperty.id, data)
        if (result.error) {
          setFeedback({ type: "error", text: result.error })
        } else {
          setShowForm(false)
          setProperties(properties.map((p: any) => p.id === editingProperty.id ? result.property : p))
          setFeedback({ type: "success", text: "Property updated successfully." })
        }
      } else {
        const { createProperty } = await import("@/lib/actions/properties")
        const result = await createProperty(data)
        if (result.error) {
          setFeedback({ type: "error", text: result.error })
        } else {
          setShowForm(false)
          setProperties([result.property, ...properties])
          setFeedback({ type: "success", text: "Property added successfully." })
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
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Inventory workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Properties</h1><p className="mt-2 text-sm text-slate-500">Manage your property inventory and connect opportunities to the right listings.</p></div>
        <button onClick={handleCreate} className="w-fit rounded-xl bg-[#07111f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#10243a]">+ Add Property</button>
      </div>

      {feedback && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role="status">{feedback.text}</div>}

      <p className="mb-4 text-sm text-slate-500">Showing {properties.length} of {total} listings</p>

      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-gray-100 rounded-lg" /></div>}>
        <PropertiesTable properties={properties} onEdit={handleEdit} onDelete={handleDelete} />
      </Suspense>

      {showForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingProperty(null)
          }}
          isLoading={isSubmitting}
        />
      )}
    </>
  )
}

function PropertiesTable({ properties, onEdit, onDelete }: { properties: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No properties yet</h3>
        <p className="mt-1 text-sm text-gray-500">Add your first listing to connect inventory with property enquiries.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds/Baths</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((prop) => (
              <tr key={prop.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{prop.name}</div>
                  {prop.projectName && <div className="text-sm text-gray-500">{prop.projectName}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{prop.type}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{prop.location}</div>
                  {prop.city && <div className="text-sm text-gray-500">{prop.city}, {prop.state}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{prop.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {prop.bedrooms ? `${prop.bedrooms}BHK` : "-"} / {prop.bathrooms ? `${prop.bathrooms} Bath` : "-"}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={prop.status} variant="property" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(prop)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                    <button onClick={() => onDelete(prop.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
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

function PropertyForm({ property, onSubmit, onCancel, isLoading = false }: any) {
  const [formData, setFormData] = useState({
    name: "",
    projectName: "",
    type: "Apartment",
    status: "AVAILABLE",
    location: "",
    address: "",
    city: "",
    state: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    possessionStatus: "",
    possessionDate: "",
    amenities: "",
    description: "",
    images: "",
    availableUnits: 1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        projectName: property.projectName || "",
        type: property.type,
        status: property.status,
        location: property.location,
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        price: property.price?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area: property.area?.toString() || "",
        possessionStatus: property.possessionStatus || "",
        possessionDate: property.possessionDate ? new Date(property.possessionDate).toISOString().slice(0, 10) : "",
        amenities: property.amenities || "",
        description: property.description || "",
        images: property.images || "",
        availableUnits: property.availableUnits || 1,
      })
    }
  }, [property])

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      price: Number(formData.price),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      area: formData.area ? Number(formData.area) : undefined,
      availableUnits: Number(formData.availableUnits),
      possessionDate: formData.possessionDate || null,
    }
    await onSubmit(submitData)
  }

  const TYPES = ["Apartment", "Villa", "Plot", "Commercial", "Office", "Retail"]
  const STATUSES = ["AVAILABLE", "RESERVED", "SOLD", "OFF_MARKET"]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {property ? "Edit Property" : "Add Property"}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="p-4 space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Details & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                  <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Units</label>
                  <input type="number" name="availableUnits" value={formData.availableUnits} onChange={handleChange} min={1} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Possession Status</label>
                  <input type="text" name="possessionStatus" value={formData.possessionStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Possession Date</label>
                  <input type="date" name="possessionDate" value={formData.possessionDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
              <textarea name="amenities" value={formData.amenities} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Comma separated list" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images (JSON array or comma-separated URLs)</label>
              <textarea name="images" value={formData.images} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? "Saving..." : property ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
