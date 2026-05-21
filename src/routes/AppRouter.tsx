import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense, type JSX } from "react"
import DashboardLayout from "@/layouts/DashboardLayout"

const Load = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<div className="p-6">Loading...</div>}>
    <Component />
  </Suspense>
)
const Dashboard = lazy(
  () => import("../features/dashboard/components/Dashboard"),
)
const Orders = lazy(() => import("../features/orders/components/Orders"))
const OrderDetail = lazy(
  () => import("../features/orders/components/OrderDetail"),
)
const Customers = lazy(
  () => import("../features/customers/components/Customers"),
)
const CustomerDetail = lazy(
  () => import("../features/customers/components/CustomerDetail"),
)
const Inventory = lazy(
  () => import("../features/inventory/components/Inventory"),
)
const ProductDetail = lazy(
  () => import("../features/inventory/components/ProductDetail"),
)
const Settings = lazy(() => import("../features/settings/components/Settings"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: Load(Dashboard) },
      { path: "orders", element: Load(Orders) },
      { path: "order_detail/:id", element: Load(OrderDetail) },
      { path: "customers", element: Load(Customers) },
      { path: "customer_detail/:id", element: Load(CustomerDetail) },
      { path: "inventory", element: Load(Inventory) },
      { path: "product_detail/:id", element: Load(ProductDetail) },
      { path: "settings", element: Load(Settings) },
    ],
  },
])
