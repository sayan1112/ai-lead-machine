"use client"

interface StatusBadgeProps {
  status: string
  variant?: "lead" | "appointment" | "property"
}

const leadStatusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-green-100 text-green-800",
  HOT: "bg-red-100 text-red-800",
  WARM: "bg-orange-100 text-orange-800",
  COLD: "bg-gray-100 text-gray-800",
  APPOINTMENT: "bg-purple-100 text-purple-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  WON: "bg-emerald-100 text-emerald-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  LOST: "bg-slate-100 text-slate-800",
}

const appointmentStatusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
}

const propertyStatusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  SOLD: "bg-red-100 text-red-800",
  RESERVED: "bg-yellow-100 text-yellow-800",
  OFF_MARKET: "bg-slate-100 text-slate-700",
}

export function StatusBadge({ status, variant = "lead" }: StatusBadgeProps) {
  const colors =
    variant === "lead"
      ? leadStatusColors
      : variant === "appointment"
      ? appointmentStatusColors
      : propertyStatusColors

  const className = colors[status] || "bg-gray-100 text-gray-800"

  const label = status === "CONVERTED" ? "Won" : status.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")

  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}
