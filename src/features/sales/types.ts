// Hand-transcribed from the backend's OpenAPI schema (AdminOrderList/AdminOrderDetail),
// not reused from src/assets/Data.ts — the real order model has no flat customer/product
// name, discount, or activity-log fields; those either don't exist server-side or live in
// nested sub-resources (items, status_history).

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed" | "partially_refunded" | "refunded"
export type OrderPaymentMethod = "stripe" | "cash_on_delivery"
export type CodStatus = "not_applicable" | "pending_collection" | "collected" | "failed" | "returned"

// The /status/ action endpoint only accepts these four — cancellation is a separate endpoint.
export type UpdatableOrderStatus = "placed" | "processing" | "shipped" | "delivered"

export interface CustomerBrief {
  id: string
  email: string
  first_name: string
  last_name: string
}

export interface OrderListItem {
  id: string
  order_number: string
  customer: CustomerBrief
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: OrderPaymentMethod
  cod_status: CodStatus
  subtotal: string
  total_amount: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product: string
  variant: string
  product_name: string
  variant_name: string
  sku: string
  quantity: number
  unit_price: string
  line_total: string
  created_at: string
}

export interface OrderStatusHistoryEntry {
  id: string
  from_status: string
  to_status: string
  changed_by: string | null
  reason?: string
  created_at?: string
}

export interface OrderDetail extends OrderListItem {
  cod_collected_amount: string
  cod_collected_at: string | null
  discount_amount: string
  shipping_cost: string
  tax_amount: string
  customer_notes: string
  admin_notes: string
  placed_at: string | null
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string
  items: OrderItem[]
  status_history: OrderStatusHistoryEntry[]
}
