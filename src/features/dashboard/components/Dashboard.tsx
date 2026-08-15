import { useEffect, useMemo } from "react"
import { ShoppingCart, Users, Package, DollarSign, PackageOpen, ShoppingBag } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"

import MetricCard from "@/features/dashboard/components/MetricCard"
import { ChartAreaDefault } from "./AreaChart"
import { DataTable } from "@/components/common/data-table"
import { ProgressBar } from "./ProgressBar"
import { EmptyState } from "@/components/common/EmptyState"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllOrders } from "@/features/sales/slices/orderSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCustomers } from "@/features/users/slices/customerSlice"
import { fetchAnalyticsSummary } from "@/features/analytics/slices/analyticsSlice"

const statusStyles = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-500",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-500",
  Failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-500",
} as const

type OrderRow = {
  id: string
  order_number: string
  customer: string
  amount: string
  status: keyof typeof statusStyles
  date: string
}

const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: orders } = useAppSelector((state) => state.orders)
  const { data: products } = useAppSelector((state) => state.products)
  const { data: customers } = useAppSelector((state) => state.customers)
  const { summary: analyticsSummary } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, page_size: 20 }))
    dispatch(fetchAllProducts({ page: 1, page_size: 20 }))
    dispatch(fetchAllCustomers())
    dispatch(fetchAnalyticsSummary())
  }, [dispatch])

  // Compute live revenue from paid orders or analytics
  const computedRevenue = useMemo(() => {
    if (analyticsSummary?.total_revenue !== undefined) {
      return Number(analyticsSummary.total_revenue)
    }
    return orders.reduce((sum, ord) => sum + Number(ord.total_amount || 0), 0)
  }, [analyticsSummary, orders])

  const metrics = useMemo(() => [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${computedRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: 0,
      icon: DollarSign,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: String(analyticsSummary?.total_orders ?? orders.length),
      change: 0,
      icon: ShoppingCart,
    },
    {
      id: "customers",
      title: "Active Customers",
      value: String(customers.length),
      change: 0,
      icon: Users,
    },
    {
      id: "inventory",
      title: "Catalog Products",
      value: String(products.length),
      change: 0,
      icon: Package,
    },
  ], [computedRevenue, analyticsSummary, orders.length, customers.length, products.length])

  const columns: ColumnDef<OrderRow>[] = useMemo(() => [
    {
      accessorKey: "order_number",
      header: "Order #",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary-500 hover:underline">
          {row.getValue("order_number") || row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-sm text-gray-800 dark:text-gray-200">
          {row.getValue("customer")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {row.getValue("amount")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusStyles
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Pending}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.getValue("date")}
        </span>
      ),
    },
  ], [])

  const recentOrders: OrderRow[] = useMemo(() => {
    return orders.slice(0, 5).map((ord) => {
      const custName = ord.customer
        ? [ord.customer.first_name, ord.customer.last_name].filter(Boolean).join(" ") || ord.customer.email
        : "Guest Customer"
      
      const status: keyof typeof statusStyles =
        ord.payment_status === "paid"
          ? "Paid"
          : ord.status === "cancelled"
            ? "Failed"
            : "Pending"

      return {
        id: ord.id,
        order_number: ord.order_number || `#${ord.id.slice(0, 8)}`,
        customer: custName,
        amount: `$${Number(ord.total_amount || 0).toFixed(2)}`,
        status,
        date: ord.created_at
          ? new Date(ord.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "N/A",
      }
    })
  }, [orders])

  const topProducts = useMemo(() => {
    return products.slice(0, 5).map((prod, index) => {
      const percentage = Math.max(15, Math.round(92 - index * 16))
      return {
        id: prod.id,
        name: prod.name,
        percentage,
      }
    })
  }, [products])

  return (
    <div className="section-container">
      <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time dynamic performance metrics for your store.
          </p>
        </div>
      </div>

      {/* Metric stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      {/* Chart Area */}
      <div className="mb-4">
        <ChartAreaDefault />
      </div>

      {/* Table & ProgressBar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Order Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white md:col-span-8 dark:border-[#16312b] dark:bg-[#0b1a17]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#16312b]">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </h2>
            <Link
              to={"/orders"}
              className="text-sm font-medium text-primary-500 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-hidden">
            <DataTable
              columns={columns}
              data={recentOrders}
              onRowClick={(order) => navigate(`/order_detail/${order.id}`)}
              showPagination={false}
              minWidth="600px"
              columnWidths={["130px", "160px", "100px", "120px", "120px"]}
              emptyTitle="No recent orders"
              emptyDescription="New incoming orders will appear here in real time."
              emptyIcon={ShoppingBag}
            />
          </div>
        </div>

        {/* Progress Bar Top Products */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 md:col-span-4 dark:border-[#16312b] dark:bg-[#0b1a17] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Top Products
              </h2>
              <Link
                to={"/products"}
                className="text-xs font-medium text-primary-500 hover:underline"
              >
                Catalog
              </Link>
            </div>
            
            {topProducts.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="No products in catalog"
                description="Add products to your catalog to track performance distributions."
                className="py-8"
              />
            ) : (
              <div className="flex w-full flex-col gap-4">
                {topProducts.map((product) => (
                  <ProgressBar
                    key={product.id}
                    label={product.name}
                    value={product.percentage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
