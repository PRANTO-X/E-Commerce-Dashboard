// Hand-transcribed from live responses — these 4 endpoints are documented as
// `additionalProperties: {}` in the OpenAPI schema (no inferred type), so these shapes
// were confirmed by calling the live API directly rather than from the spec.

export interface AnalyticsSummary {
  total_orders: number
  total_revenue: string
  average_order_value: string
  return_rate: string
}

export interface SalesPoint {
  period: string
  order_count: number
  revenue: number
}

export interface TopProduct {
  product__id: string
  product__name: string
  total_quantity: number
  total_revenue: number
}

export interface ReturnsSummary {
  total_orders: number
  total_returns: number
  return_rate: string
}
