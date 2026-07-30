// Hand-transcribed from the OpenAPI schema (CourierIntegration/CourierShipment). Couriers
// only support list+create (no per-id retrieve/update/delete, like Warehouses); shipments
// are read-only except for booking (via the order-scoped action endpoint) and tracking.

export type CourierProvider = "pathao" | "steadfast" | "redx" | "ecourier"
export type CourierShipmentStatus = "draft" | "booked" | "failed" | "cancelled"
export type TrackingStatus = "processing" | "in_transit" | "out_for_delivery" | "delivered" | "exception"

export interface CourierIntegration {
  id: string
  provider: CourierProvider
  display_name: string
  is_active: boolean
  base_url: string
  created_at: string
  updated_at: string
}

export interface CourierIntegrationPayload {
  provider: CourierProvider
  display_name: string
  is_active: boolean
  base_url?: string
  credentials?: Record<string, unknown>
}

export interface CourierShipment {
  id: string
  order: string
  order_number: string
  integration: string
  provider: string
  provider_order_id: string
  tracking_number: string
  status: CourierShipmentStatus
}

export interface BookCourierShipmentPayload {
  integration_id: string
  payload?: Record<string, unknown>
}

export interface TrackingPayload {
  carrier: string
  tracking_number: string
  tracking_url?: string
  estimated_delivery?: string | null
}

export interface TrackingUpdatePayload {
  status?: TrackingStatus
  tracking_url?: string
}
