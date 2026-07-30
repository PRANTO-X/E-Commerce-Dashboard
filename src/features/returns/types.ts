// The admin returns endpoints are documented as `additionalProperties: {}` in the OpenAPI
// schema (drf-spectacular couldn't infer a response type for them), but the underlying
// `ReturnRequest` component schema exists and is used by the same serializer — this is
// hand-transcribed from that, not live-verified against a real return (creating one via
// the customer API hit an unrelated backend validation quirk). Render defensively.

export type ReturnStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "awaiting_return"
  | "in_transit"
  | "received"
  | "processed"
  | "refunded"
  | "replaced"
  | "completed"

export type ReturnReason = "damaged" | "wrong_item" | "missing_item" | "defective" | "other"
export type ReturnResolution = "refund" | "replacement" | "store_credit"

export interface ReturnItem {
  order_item: string
  quantity: number
  reason: ReturnReason
  condition_notes: string
}

export interface ReturnStatusHistoryEntry {
  from_status: string
  to_status: string
  reason: string
  created_at: string
}

export interface ReturnRequest {
  id: string
  return_number: string
  order: string
  customer: string
  status: ReturnStatus
  reason: ReturnReason
  resolution: ReturnResolution | null
  comments: string
  admin_notes: string
  rejection_reason: string
  refund_amount: string | null
  items: ReturnItem[]
  images: string[]
  status_history: ReturnStatusHistoryEntry[]
  created_at: string
  updated_at: string
}

export interface ApproveReturnPayload {
  resolution: ReturnResolution
  refund_amount?: string
  admin_notes?: string
}

export interface RejectReturnPayload {
  rejection_reason: string
  admin_notes?: string
}
