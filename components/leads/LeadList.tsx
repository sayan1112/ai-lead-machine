"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Lead } from "@prisma/client"

interface LeadListProps {
  leads: (Lead & {
    assignedTo?: { id: string; name: string; email: string } | null
    leadScores?: { score: number; classification: string }[]
    _count?: { appointments: number; conversations: number }
  })[]
  onEdit: (lead: any) => void
  onDelete: (id: string) => void
  onView: (lead: any) => void
}

export function LeadList({ leads, onEdit, onDelete, onView }: LeadListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sourceFilter, setSourceFilter] = useState("ALL")

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery) ||
      lead.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter
    const matchesSource = sourceFilter === "ALL" || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  if (filteredLeads.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new lead.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="COLD">Cold</option>
            <option value="APPOINTMENT">Appointment</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="MANUAL">Manual</option>
            <option value="IMPORT">Import</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    {lead.location && (
                      <div className="text-sm text-gray-500">{lead.location}</div>
                    )}
                    {lead.propertyType && (
                      <div className="text-xs text-gray-400">{lead.propertyType}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{lead.email || "-"}</div>
                  {lead.phone && <div className="text-sm text-gray-500">{lead.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} variant="lead" />
                </td>
                <td className="px-6 py-4">
                  {lead.budget ? `₹${lead.budget.toLocaleString()}` : "-"}
                </td>
                <td className="px-6 py-4">
                  {lead.leadScores && lead.leadScores.length > 0 ? (
                    <span className={`font-medium ${
                      lead.leadScores[0].classification === "HOT" ? "text-red-600" :
                      lead.leadScores[0].classification === "WARM" ? "text-orange-600" : "text-gray-600"
                    }`}>
                      {lead.leadScores[0].score} ({lead.leadScores[0].classification})
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(lead)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
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