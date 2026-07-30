// Hand-transcribed from the OpenAPI schema — not reused from src/assets/Data.ts, whose
// mock Coupon/Campaign shapes (usageLimit, expiryDate, productIds, bannerImage, ...) don't
// match the real models. Campaigns have no product-linkage field in the real API at all.

export type DiscountType = "percentage" | "fixed_amount"

export interface Coupon {
  id: string
  code: string
  description: string
  discount_type: DiscountType
  discount_value: string
  min_order_value: string
  max_discount_amount: string | null
  max_usage_count: number | null
  usage_count: number
  per_customer_limit: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CampaignType = "mega" | "landing" | "seasonal"
export type CampaignStatus = "draft" | "scheduled" | "active" | "ended"

export interface Campaign {
  id: string
  name: string
  slug: string
  campaign_type: CampaignType
  status: CampaignStatus
  starts_at: string
  ends_at: string
  hero_title: string
  banner_image: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FlashSale {
  id: string
  name: string
  starts_at: string
  ends_at: string
  is_active: boolean
  campaign: string | null
  created_at: string
  updated_at: string
}

export interface FlashSaleItem {
  id: string
  flash_sale: string
  variant: string
  sale_price: string
  stock_limit: number
  sold_quantity: number
  created_at: string
  updated_at: string
}

export type GroupBuyStatus = "draft" | "active" | "completed" | "failed"

export interface GroupBuy {
  id: string
  name: string
  product: string
  target_quantity: number
  current_quantity: number
  group_price: string
  starts_at: string
  ends_at: string
  status: GroupBuyStatus
  created_at: string
  updated_at: string
}

export type ReviewStatus = "pending" | "approved" | "rejected"

export interface Review {
  id: string
  product: string
  customer: string
  order_item: string
  rating: number
  title: string
  content: string
  status: ReviewStatus
  images: { image: string }[]
  created_at: string
}

export type AutomationEventType = "abandoned_cart" | "back_in_stock" | "price_drop"

export interface AutomationEvent {
  id: string
  event_type: AutomationEventType
  payload: Record<string, unknown>
  scheduled_at: string | null
  sent_at: string | null
  cancelled_at: string | null
  customer: string
  product: string | null
  variant: string | null
  created_at: string
  updated_at: string
}
