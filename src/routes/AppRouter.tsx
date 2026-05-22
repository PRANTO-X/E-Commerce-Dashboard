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

const Products = lazy(() => import("../features/catalog/components/Products"))
const ProductForm = lazy(() => import("../features/catalog/components/ProductForm"))

const Categories = lazy(
  () => import("../features/catalog/components/Categories"),
)
const CategoryForm= lazy(() => import("../features/catalog/components/CategoryForm"))

const Inventory = lazy(() => import("../features/catalog/components/Inventory"))
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

const Customers = lazy(() => import("../features/users/components/Customers"))
const CustomerDetail = lazy(
  () => import("../features/users/components/CustomerDetail"),
)

const Staffs = lazy(() => import("../features/users/components/Staffs"))

const Reports = lazy(() => import("../features/analytics/components/Reports"))

const Settings = lazy(() => import("../features/system/components/Settings"))

const Authentication = lazy(
  () => import("../features/system/components/Authentication"),
)
const Roles = lazy(() => import("../features/system/components/Roles"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: Load(Dashboard) },
      { path: "inventory", element: Load(Inventory) },
      { path: "products", element: Load(Products) },
      { path: "product_detail/:id", element: Load(ProductDetail) },
      { path: "product_form/:id", element: Load(ProductForm) },
      { path: "categories", element: Load(Categories) },
      { path: "category_form/:id", element: Load(CategoryForm) },
      { path: "orders", element: Load(Orders) },
      { path: "order_detail/:id", element: Load(OrderDetail) },
      { path: "transactions", element: Load(Transactions) },
      { path: "customers", element: Load(Customers) },
      { path: "customer_detail/:id", element: Load(CustomerDetail) },
      { path: "staffs", element: Load(Staffs) },
      { path: "reports", element: Load(Reports) },
      { path: "settings", element: Load(Settings) },
      { path: "auth-settings", element: Load(Authentication) },
      { path: "roles", element: Load(Roles) },
    ],
  },
])
