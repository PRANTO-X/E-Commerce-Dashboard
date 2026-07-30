import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense, type JSX } from "react"
import DashboardLayout from "@/layouts/DashboardLayout"
import Loader from "@/components/common/Loader"
import RequireAuth from "@/routes/RequireAuth"

const Load = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
)
const Dashboard = lazy(
  () => import("../features/dashboard/components/Dashboard"),
)

const Products = lazy(() => import("../features/catalog/components/Products"))
const ProductForm = lazy(() => import("../features/catalog/components/ProductForm"))

const Categories = lazy(
  () => import("../features/catalog/components/Categories"),
)
const CategoryForm= lazy(() => import("../features/catalog/components/CategoryForm"))

const Inventory = lazy(() => import("../features/catalog/components/Inventory"))
const Attributes = lazy(() => import("../features/catalog/components/Attributes"))
const Warehouses = lazy(() => import("../features/catalog/components/Warehouses"))
const Reservations = lazy(() => import("../features/catalog/components/Reservations"))
const ProductDetail = lazy(
  () => import("../features/catalog/components/ProductDetail"),
)
const Orders = lazy(() => import("../features/sales/components/Orders"))
const OrderDetail = lazy(
  () => import("../features/sales/components/OrderDetail"),
)

const Transactions = lazy(
  () => import("../features/sales/components/Transactions"),
)
const TransactionDetail = lazy(
  () => import("../features/sales/components/TransactionDetail"),
)

const Customers = lazy(() => import("../features/users/components/Customers"))
const CustomerDetail = lazy(
  () => import("../features/users/components/CustomerDetail"),
)

const Staffs = lazy(() => import("../features/users/components/Staffs"))
const StaffForm = lazy(() => import("../features/users/components/StaffForm"))

const Reports = lazy(() => import("../features/analytics/components/Reports"))

const Settings = lazy(() => import("../features/system/components/Settings"))

const Authentication = lazy(
  () => import("../features/system/components/Authentication"),
)
const Roles = lazy(() => import("../features/system/components/Roles"))

const Coupons = lazy(() => import("../features/marketing/components/Coupons"))
const CouponForm = lazy(() => import("../features/marketing/components/CouponForm"))
const Campaigns = lazy(() => import("../features/marketing/components/Campaigns"))
const CampaignDetail = lazy(() => import("../features/marketing/components/CampaignDetail"))
const CampaignForm = lazy(() => import("../features/marketing/components/CampaignForm"))
const Reviews = lazy(() => import("../features/marketing/components/Reviews"))
const FlashSales = lazy(() => import("../features/marketing/components/FlashSales"))
const GroupBuys = lazy(() => import("../features/marketing/components/GroupBuys"))
const Automations = lazy(() => import("../features/marketing/components/Automations"))

const Banners = lazy(() => import("../features/cms/components/Banners"))
const BlogPosts = lazy(() => import("../features/cms/components/BlogPosts"))
const Pages = lazy(() => import("../features/cms/components/Pages"))
const PageForm = lazy(() => import("../features/cms/components/PageForm"))

const Notifications = lazy(() => import("../features/notifications/components/Notifications"))
const AuditLogs = lazy(() => import("../features/audit/components/AuditLogs"))

const Payments = lazy(() => import("../features/payments/components/Payments"))
const PaymentDetail = lazy(() => import("../features/payments/components/PaymentDetail"))
const Returns = lazy(() => import("../features/returns/components/Returns"))
const ReturnDetail = lazy(() => import("../features/returns/components/ReturnDetail"))
const Couriers = lazy(() => import("../features/shipping/components/Couriers"))
const Shipments = lazy(() => import("../features/shipping/components/Shipments"))

const SignInForm = lazy(
  () => import("../features/authentication/components/SignInForm"),
)

export const router = createBrowserRouter([
  { path: "/login", element: Load(SignInForm) },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: Load(Dashboard) },
          { path: "inventory", element: Load(Inventory) },
          { path: "attributes", element: Load(Attributes) },
          { path: "warehouses", element: Load(Warehouses) },
          { path: "inventory/reservations", element: Load(Reservations) },
          { path: "products", element: Load(Products) },
          { path: "product_detail/:id", element: Load(ProductDetail) },
          { path: "product_form/:id", element: Load(ProductForm) },
          { path: "categories", element: Load(Categories) },
          { path: "category_form/:id", element: Load(CategoryForm) },
          { path: "orders", element: Load(Orders) },
          { path: "order_detail/:id", element: Load(OrderDetail) },
          { path: "transactions", element: Load(Transactions) },
          { path: "transaction_detail/:id", element: Load(TransactionDetail) },
          { path: "customers", element: Load(Customers) },
          { path: "customer_detail/:id", element: Load(CustomerDetail) },
          { path: "staffs", element: Load(Staffs) },
          { path: "staff_form/:id", element: Load(StaffForm) },
          { path: "reports", element: Load(Reports) },
          { path: "settings", element: Load(Settings) },
          { path: "auth-settings", element: Load(Authentication) },
          { path: "roles", element: Load(Roles) },
          { path: "coupons", element: Load(Coupons) },
          { path: "coupon_form/:id", element: Load(CouponForm) },
          { path: "campaigns", element: Load(Campaigns) },
          { path: "campaign_detail/:id", element: Load(CampaignDetail) },
          { path: "campaign_form/:id", element: Load(CampaignForm) },
          { path: "reviews", element: Load(Reviews) },
          { path: "flash-sales", element: Load(FlashSales) },
          { path: "group-buys", element: Load(GroupBuys) },
          { path: "automations", element: Load(Automations) },
          { path: "banners", element: Load(Banners) },
          { path: "blog-posts", element: Load(BlogPosts) },
          { path: "pages", element: Load(Pages) },
          { path: "page_form/:id", element: Load(PageForm) },
          { path: "notifications", element: Load(Notifications) },
          { path: "audit-logs", element: Load(AuditLogs) },
          { path: "payments", element: Load(Payments) },
          { path: "payment_detail/:id", element: Load(PaymentDetail) },
          { path: "returns", element: Load(Returns) },
          { path: "return_detail/:id", element: Load(ReturnDetail) },
          { path: "couriers", element: Load(Couriers) },
          { path: "shipments", element: Load(Shipments) },
        ],
      },
    ],
  },
])
