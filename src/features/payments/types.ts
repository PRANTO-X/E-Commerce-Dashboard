// Hand-transcribed from the backend's OpenAPI schema (AdminPayment). Payments has no
// pagination (schema declares a bare array) and no PATCH/PUT — only list, retrieve, and
// a refund action — so this domain is bespoke, not sliceFactory-based.

export type PaymentProvider = "stripe" | "cash_on_delivery"
export type PaymentTransactionState = "pending" | "succeeded" | "failed" | "cancelled"

export interface OrderBrief {
  id: string
  order_number: string
}

export interface Payment {
  id: string
  order: OrderBrief
  provider: PaymentProvider
  provider_payment_intent_id: string | null
  amount: string
  currency: string
  status: PaymentTransactionState
  failure_reason: string
  created_at: string
  processed_at: string | null
}

export interface RefundPayload {
  amount: string
  reason?: string
}
