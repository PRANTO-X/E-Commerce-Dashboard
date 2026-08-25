import type { ReactNode } from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "destructive" | "info" | "secondary"

/**
 * Canonical status-key -> tone map, shared across every domain in the app
 * (orders, payments, returns, reviews, notifications, shipments, campaigns,
 * reservations, products, expenses, and every active/inactive or
 * published/draft boolean). Add new keys here rather than inventing a new
 * local color map in a feature file — that's how 18 divergent status pills
 * happened in the first place.
 *
 * Where a word means the same thing everywhere (e.g. "active", "pending",
 * "failed"), it gets one tone. A couple of words meant different things in
 * different files before this consolidation (e.g. "draft" was amber for
 * products but gray for campaigns/shipments, "cancelled" was gray for
 * payments but red for orders/shipments) — those were normalized to one
 * canonical tone here rather than kept ambiguous.
 */
const STATUS_TONES: Record<string, StatusTone> = {
  // generic booleans (active/inactive, published/draft)
  active: "success",
  inactive: "destructive",
  enabled: "success",
  disabled: "destructive",
  published: "success",
  draft: "secondary",
  archived: "secondary",

  // order fulfillment
  pending_payment: "secondary",
  placed: "info",
  processing: "info",
  shipped: "success",
  delivered: "success",
  cancelled: "destructive",

  // payment / order payment_status / expense status
  paid: "success",
  succeeded: "success",
  pending: "warning",
  failed: "destructive",
  partially_refunded: "warning",
  refunded: "info",

  // returns
  pending_review: "warning",
  approved: "success",
  rejected: "destructive",
  replaced: "success",
  completed: "success",

  // reviews / notifications / shipments
  sent: "success",
  booked: "success",

  // campaigns
  scheduled: "info",
  ended: "destructive",

  // reservations
  consumed: "info",
  released: "secondary",
  expired: "destructive",
}

/** Representative solid hex per tone, for contexts that need a literal color (e.g. recharts fill) rather than a Tailwind class. */
export const STATUS_TONE_HEX: Record<StatusTone, string> = {
  success: "#22c55e",
  warning: "#eab308",
  destructive: "#ef4444",
  info: "#3b82f6",
  secondary: "#6b7280",
}

export function getStatusTone(status: string | null | undefined, fallback: StatusTone = "secondary"): StatusTone {
  if (!status) return fallback
  return STATUS_TONES[status.toLowerCase()] ?? fallback
}

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  /** The raw status/enum value, e.g. "pending_payment" or "active". */
  status: string
  /** Override the tone the canonical map would otherwise resolve to. */
  tone?: StatusTone
  /** Override the default label (title-cased, underscores replaced with spaces). */
  label?: ReactNode
}

export function StatusBadge({ status, tone, label, className, ...props }: StatusBadgeProps) {
  const resolvedTone = tone ?? getStatusTone(status)
  return (
    <Badge variant={resolvedTone} className={cn("capitalize", className)} {...props}>
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  )
}
