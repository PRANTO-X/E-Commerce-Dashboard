// Hand-transcribed from the OpenAPI schema examples (the admin users/staff endpoints are
// documented as `additionalProperties: {}` but the examples show the real shape). Not
// reused from src/assets/Data.ts — the real User model has no totalOrders/totalSpent/
// address/notes fields; those either don't exist server-side or belong to a separate
// /customer/addresses/ resource not covered by this batch.

export type UserRole = "admin" | "staff" | "customer"

// The fixed permission codes the backend actually recognizes (PermissionsEnum) — distinct
// from the "*" wildcard a superuser account may carry.
export type PermissionCode =
  | "products.view"
  | "products.create"
  | "products.update"
  | "orders.view"
  | "orders.update_status"
  | "returns.view"
  | "support.view_customers"
  | "inventory.view"

export const permissionCodes: PermissionCode[] = [
  "products.view",
  "products.create",
  "products.update",
  "orders.view",
  "orders.update_status",
  "returns.view",
  "support.view_customers",
  "inventory.view",
]

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone: string
  profile_picture: string
  is_active: boolean
  is_email_verified: boolean
  is_superuser: boolean
  permissions: string[]
}

export interface StaffCreatePayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  profile_picture?: string
  permissions?: PermissionCode[]
}

export interface StaffUpdatePayload {
  first_name?: string
  last_name?: string
  phone?: string
  profile_picture?: string
  is_active?: boolean
}

export interface AdminUserUpdatePayload {
  first_name?: string
  last_name?: string
  phone?: string
  profile_picture?: string
  is_active?: boolean
  is_email_verified?: boolean
}
