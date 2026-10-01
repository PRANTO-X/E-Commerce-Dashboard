import { z } from "zod"
import type { VariantStatus } from "@/features/catalog/types"

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[-a-zA-Z0-9_]+$/, "Use only letters, numbers, - and _"),
  category: z.string().min(1, "Select a category"),
  base_price: z.number().positive("Price must be greater than 0"),
  status: z.enum(["draft", "active", "inactive", "archived"]),
  product_type: z.enum(["physical", "digital", "subscription", "bundle"]),
  requires_shipping: z.boolean(),
  is_downloadable: z.boolean(),
  is_recurring: z.boolean(),
  is_featured: z.boolean(),
  bundle_pricing_mode: z.enum(["fixed", "dynamic"]).optional(),
  bundle_discount_percent: z.string().optional(),
  description: z.string().min(1, "Description is required"),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const defaultFormValues: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  base_price: 0,
  status: "draft",
  product_type: "physical",
  requires_shipping: true,
  is_downloadable: false,
  is_recurring: false,
  is_featured: false,
  bundle_pricing_mode: "fixed",
  bundle_discount_percent: "0",
  description: "",
}

export interface DraftVariant {
  tempId: string
  sku: string
  name: string
  price: string
  stock_quantity: string
  status: VariantStatus
  image?: string
}

export interface DraftBundleItem {
  tempId: string
  variantId: string
  variantName: string
  variantSku: string
  price: number
  quantity: number
}

/** A variant row as rendered by the variants list (saved variant or local draft). */
export interface DisplayVariant {
  key: string
  sku: string
  name: string
  price: string
  stock_quantity: string
  status: VariantStatus
}

/** A bundle component row as rendered by the bundle builder (saved item or local draft). */
export interface DisplayBundleItem {
  id: string
  variantId: string
  variantName: string
  variantSku: string
  price: number
  quantity: number
}
