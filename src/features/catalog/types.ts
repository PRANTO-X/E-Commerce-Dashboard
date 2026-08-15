// Hand-transcribed from the backend's OpenAPI schema (AdminCategory component),
// not reused from src/assets/Data.ts — the mock shape doesn't match the real API
// (no `products` count, no draft/inactive status enum, parent is a category UUID).

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  parent: string | null
  image: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProductStatus = "draft" | "active" | "inactive" | "archived"
export type ProductType = "physical" | "digital" | "subscription" | "bundle"

export const productStatusOptions: { label: string; value: ProductStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
]

export const productTypeOptions: { label: string; value: ProductType }[] = [
  { label: "Physical", value: "physical" },
  { label: "Digital", value: "digital" },
  { label: "Subscription", value: "subscription" },
  { label: "Bundle", value: "bundle" },
]

export const productStatusStyles: Record<ProductStatus, string> = {
  draft: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
  archived: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
}

// Hand-transcribed from AdminProduct — note there is no flat price/stock/image/rating/sales
// here like the old mock ProductItem had. base_price is a decimal string per the API.
// Stock lives in Inventory (batch 4), images are a separate sub-resource (ProductImage below).
export type BundlePricingMode = "fixed" | "dynamic"

export interface Product {
  id: string
  category: string
  name: string
  slug: string
  description: string
  base_price: string
  status: ProductStatus
  product_type: ProductType
  requires_shipping: boolean
  is_downloadable: boolean
  is_recurring: boolean
  is_featured: boolean
  bundle_pricing_mode?: BundlePricingMode
  bundle_discount_percent?: string
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface BundleItem {
  id: string
  bundle: string
  variant: string
  variant_sku?: string
  variant_name?: string
  quantity: number
  created_at?: string
  updated_at?: string
}

export interface ProductImage {
  id: string
  product: string
  image: string
  alt_text: string
  sort_order: number
  is_primary: boolean
}

export interface Attribute {
  id: string
  name: string
  slug: string
}

export interface AttributeValue {
  id: string
  attribute: string
  value: string
  slug: string
}

export type VariantStatus = "active" | "inactive"

export interface Variant {
  id: string
  product: string
  sku: string
  name: string
  price: string
  cost_price?: string | null
  stock_quantity: number
  status: VariantStatus
  image: string
  options?: { attribute: string; attribute_name?: string; value: string; value_name?: string }[]
  created_at: string
  updated_at: string
}

// Inventory domain: NOT a generic CRUD list like the rest of catalog — the backend only
// exposes list+create for warehouses, action-only endpoints for adjustments, and read-only
// per-variant summaries. Modeled with bespoke thunks in inventorySlice.ts, not sliceFactory.

export interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  city: string
  is_branch: boolean
  is_active: boolean
  created_at: string
}

export interface WarehouseStock {
  id: string
  warehouse: string
  variant: string
  quantity: number
  safety_stock: number
  available_quantity: number
  created_at: string
}

export interface SetWarehouseStockPayload {
  warehouse_id: string
  variant_id: string
  quantity: number
  safety_stock?: number
}

export interface StockAdjustmentPayload {
  variant_id: string
  quantity_changed: number
  notes?: string
}

export type StockReservationStatus = "active" | "consumed" | "released" | "expired"

export interface StockReservation {
  id: string
  variant: string
  user: string
  order: string | null
  quantity: number
  status: StockReservationStatus
  expires_at: string
  created_at: string
  updated_at: string
}

export type TransactionType =
  | "order_placed"
  | "cancellation"
  | "return_received"
  | "refund"
  | "manual_adjustment"
  | "correction"

export interface InventoryTransaction {
  id: string
  variant: string
  transaction_type: TransactionType
  quantity_changed: number
  stock_before: number
  stock_after: number
  reference_type: string
}

export interface VariantStockSummary {
  variant_id: string
  sku: string
  physical_stock: number
  active_reservations: number
  net_available: number
}
