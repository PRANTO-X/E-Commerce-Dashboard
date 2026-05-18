import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"
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
const OrderDetail = lazy(()=> import('../features/orders/components/OrderDetail'))
const Customers = lazy(
  () => import("../features/customers/components/Customers"),
)
const Inventory = lazy(
  () => import("../features/inventory/components/Inventory"),
)
const Settings = lazy(() => import("../features/settings/components/Settings"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: Load(Dashboard) },
      { path: "orders", element: Load(Orders) },
      { path: "order_detail:/id", element: Load(OrderDetail) },
      { path: "customers", element: Load(Customers) },
      { path: "inventory", element: Load(Inventory) },
      { path: "settings", element: Load(Settings) },
    ],
  },
])
