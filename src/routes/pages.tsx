import { lazy } from "react"
// Route-level code splitting. Kept apart from AppRouter so that file exports only the
// router object, which keeps React Fast Refresh working for these page components.

export const Dashboard = lazy(
  () => import("../features/dashboard/components/Dashboard"),
)

export const Products = lazy(() => import("../features/catalog/components/Products"))
export const ProductForm = lazy(() => import("../features/catalog/components/ProductForm"))

export const Categories = lazy(
  () => import("../features/catalog/components/Categories"),
)
export const CategoryForm= lazy(() => import("../features/catalog/components/CategoryForm"))

export const Inventory = lazy(() => import("../features/catalog/components/Inventory"))
export const Attributes = lazy(() => import("../features/catalog/components/Attributes"))
export const Warehouses = lazy(() => import("../features/catalog/components/Warehouses"))
export const Reservations = lazy(() => import("../features/catalog/components/Reservations"))
export const ProductDetail = lazy(
  () => import("../features/catalog/components/ProductDetail"),
)
export const Orders = lazy(() => import("../features/sales/components/Orders"))
export const OrderDetail = lazy(
  () => import("../features/sales/components/OrderDetail"),
)

export const Customers = lazy(() => import("../features/users/components/Customers"))
export const CustomerDetail = lazy(
  () => import("../features/users/components/CustomerDetail"),
)

export const Staffs = lazy(() => import("../features/users/components/Staffs"))
export const StaffForm = lazy(() => import("../features/users/components/StaffForm"))
export const Profile = lazy(() => import("../features/users/components/Profile"))

export const Reports = lazy(() => import("../features/analytics/components/Reports"))

export const Settings = lazy(() => import("../features/system/components/Settings"))

export const Authentication = lazy(
  () => import("../features/system/components/Authentication"),
)
export const Roles = lazy(() => import("../features/system/components/Roles"))

export const Coupons = lazy(() => import("../features/marketing/components/Coupons"))
export const CouponForm = lazy(() => import("../features/marketing/components/CouponForm"))
export const Campaigns = lazy(() => import("../features/marketing/components/Campaigns"))
export const CampaignDetail = lazy(() => import("../features/marketing/components/CampaignDetail"))
export const CampaignForm = lazy(() => import("../features/marketing/components/CampaignForm"))
export const Reviews = lazy(() => import("../features/marketing/components/Reviews"))
export const FlashSales = lazy(() => import("../features/marketing/components/FlashSales"))
export const GroupBuys = lazy(() => import("../features/marketing/components/GroupBuys"))
export const Automations = lazy(() => import("../features/marketing/components/Automations"))

export const Banners = lazy(() => import("../features/cms/components/Banners"))
export const BlogPosts = lazy(() => import("../features/cms/components/BlogPosts"))
export const Pages = lazy(() => import("../features/cms/components/Pages"))
export const PageForm = lazy(() => import("../features/cms/components/PageForm"))

export const Notifications = lazy(() => import("../features/notifications/components/Notifications"))
export const AuditLogs = lazy(() => import("../features/audit/components/AuditLogs"))

export const Payments = lazy(() => import("../features/payments/components/Payments"))
export const PaymentDetail = lazy(() => import("../features/payments/components/PaymentDetail"))
export const Returns = lazy(() => import("../features/returns/components/Returns"))
export const ReturnDetail = lazy(() => import("../features/returns/components/ReturnDetail"))
export const Couriers = lazy(() => import("../features/shipping/components/Couriers"))
export const Shipments = lazy(() => import("../features/shipping/components/Shipments"))
export const Expenses = lazy(() => import("../features/finance/components/Expenses"))

export const SignInForm = lazy(
  () => import("../features/authentication/components/SignInForm"),
)

