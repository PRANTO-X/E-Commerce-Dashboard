import { createBrowserRouter, Navigate } from "react-router-dom"
import { Suspense, type JSX } from "react"
import DashboardLayout from "@/layouts/DashboardLayout"
import Loader from "@/components/common/Loader"
import RequireAuth from "@/routes/RequireAuth"
import RouteError from "@/routes/RouteError"
import NotFound from "@/routes/NotFound"
import { DEV_AUTH_BYPASS } from "@/features/authentication/devAuth"
import * as Page from "@/routes/pages"

const load = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  // With the dev bypass on there is no session to establish, so the sign-in
  // screen would only ever dead-end. Send it straight to the dashboard.
  {
    path: "/login",
    element: DEV_AUTH_BYPASS ? <Navigate to="/" replace /> : load(Page.SignInForm),
    errorElement: <RouteError />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <DashboardLayout />,
        // Errors inside a page render within the layout, so the sidebar stays usable.
        errorElement: <RouteError />,
        children: [
          { index: true, element: load(Page.Dashboard) },
          { path: "inventory", element: load(Page.Inventory) },
          { path: "attributes", element: load(Page.Attributes) },
          { path: "warehouses", element: load(Page.Warehouses) },
          { path: "inventory/reservations", element: load(Page.Reservations) },
          { path: "products", element: load(Page.Products) },
          { path: "product_detail/:id", element: load(Page.ProductDetail) },
          { path: "product_form/:id", element: load(Page.ProductForm) },
          { path: "categories", element: load(Page.Categories) },
          { path: "category_form/:id", element: load(Page.CategoryForm) },
          { path: "orders", element: load(Page.Orders) },
          { path: "order_detail/:id", element: load(Page.OrderDetail) },
          { path: "customers", element: load(Page.Customers) },
          { path: "customer_detail/:id", element: load(Page.CustomerDetail) },
          { path: "staffs", element: load(Page.Staffs) },
          { path: "staff_form/:id", element: load(Page.StaffForm) },
          { path: "reports", element: load(Page.Reports) },
          { path: "settings", element: load(Page.Settings) },
          { path: "profile", element: load(Page.Profile) },
          { path: "auth-settings", element: load(Page.Authentication) },
          { path: "roles", element: load(Page.Roles) },
          { path: "coupons", element: load(Page.Coupons) },
          { path: "coupon_form/:id", element: load(Page.CouponForm) },
          { path: "campaigns", element: load(Page.Campaigns) },
          { path: "campaign_detail/:id", element: load(Page.CampaignDetail) },
          { path: "campaign_form/:id", element: load(Page.CampaignForm) },
          { path: "reviews", element: load(Page.Reviews) },
          { path: "flash-sales", element: load(Page.FlashSales) },
          { path: "group-buys", element: load(Page.GroupBuys) },
          { path: "automations", element: load(Page.Automations) },
          { path: "banners", element: load(Page.Banners) },
          { path: "blog-posts", element: load(Page.BlogPosts) },
          { path: "pages", element: load(Page.Pages) },
          { path: "page_form/:id", element: load(Page.PageForm) },
          { path: "notifications", element: load(Page.Notifications) },
          { path: "audit-logs", element: load(Page.AuditLogs) },
          { path: "payments", element: load(Page.Payments) },
          { path: "payment_detail/:id", element: load(Page.PaymentDetail) },
          { path: "returns", element: load(Page.Returns) },
          { path: "return_detail/:id", element: load(Page.ReturnDetail) },
          { path: "couriers", element: load(Page.Couriers) },
          { path: "shipments", element: load(Page.Shipments) },
          { path: "expenses", element: load(Page.Expenses) },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
])
