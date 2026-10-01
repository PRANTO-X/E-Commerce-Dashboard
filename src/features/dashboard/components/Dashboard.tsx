import { useEffect, useMemo, useCallback } from "react"
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
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { Card } from "@/components/ui/card"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useLocalFetch } from "@/features/analytics/useLocalFetch"
import type { OrderListItem } from "@/features/sales/types"
import { formatCurrency, formatDate } from "@/lib/format"

const RECENT_LIMIT = 5

type OrderRow = {
  id: string
  order_number: string
  customer: string
  amount: string
  status: "Paid" | "Pending" | "Failed"
  date: string
}

const Dashboard = () => {
  useDocumentTitle("Overview")

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { summary: analyticsSummary } = useAppSelector((state) => state.analytics)

  // Each widget keeps its own fetch result instead of reading the shared slices, whose
  // contents (page size, filters) belong to whichever screen fetched last. Totals come from
  // the server's count, not from the length of the (small) page we load here.
  const startOrders = useCallback(
    () => dispatch(fetchAllOrders({ page: 1, page_size: RECENT_LIMIT })),
    [dispatch]
  )
  const startProducts = useCallback(
    () => dispatch(fetchAllProducts({ page: 1, page_size: RECENT_LIMIT })),
    [dispatch]
  )
  // /admin/users/ is unpaginated and returns every account, so customers are counted from it.
  const startCustomers = useCallback(() => dispatch(fetchAllCustomers()), [dispatch])

  const ordersFetch = useLocalFetch(startOrders)
  const productsFetch = useLocalFetch(startProducts)
  const customersFetch = useLocalFetch(startCustomers)

  const orders = useMemo(() => (ordersFetch.data?.data ?? []) as OrderListItem[], [ordersFetch.data])
  const products = useMemo(() => productsFetch.data?.data ?? [], [productsFetch.data])

  useEffect(() => {
    const request = dispatch(fetchAnalyticsSummary())
    return () => request.abort()
  }, [dispatch])

  const activeCustomerCount = useMemo(() => {
    if (!customersFetch.data) return null
    return customersFetch.data.data.filter((u) => u.role === "customer" && u.is_active).length
  }, [customersFetch.data])

  const metrics = useMemo(() => [
    {
      id: "revenue",
      title: "Total Revenue",
      value: analyticsSummary ? formatCurrency(analyticsSummary.total_revenue) : "—",
      change: 0,
      icon: DollarSign,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: analyticsSummary
        ? analyticsSummary.total_orders.toLocaleString()
        : ordersFetch.data
          ? ordersFetch.data.total.toLocaleString()
          : "—",
      change: 0,
      icon: ShoppingCart,
    },
    {
      id: "customers",
      title: "Active Customers",
      value: activeCustomerCount === null ? "—" : activeCustomerCount.toLocaleString(),
      change: 0,
      icon: Users,
    },
    {
      id: "inventory",
      title: "Catalog Products",
      value: productsFetch.data ? productsFetch.data.total.toLocaleString() : "—",
      change: 0,
      icon: Package,
    },
  ], [analyticsSummary, ordersFetch.data, activeCustomerCount, productsFetch.data])

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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as string} />
      ),
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
    return orders.slice(0, RECENT_LIMIT).map((ord) => {
      const custName = ord.customer
        ? [ord.customer.first_name, ord.customer.last_name].filter(Boolean).join(" ") || ord.customer.email
        : "Guest Customer"
      
      const status: OrderRow["status"] =
        ord.payment_status === "paid"
          ? "Paid"
          : ord.status === "cancelled"
            ? "Failed"
            : "Pending"

      return {
        id: ord.id,
        order_number: ord.order_number || `#${ord.id.slice(0, 8)}`,
        customer: custName,
        amount: formatCurrency(ord.total_amount),
        status,
        date: formatDate(ord.created_at, "N/A"),
      }
    })
  }, [orders])

  const topProducts = useMemo(() => {
    return products.slice(0, RECENT_LIMIT).map((prod, index) => {
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
        <PageHeading
          title="Overview"
          description="Real-time dynamic performance metrics for your store."
        />
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
        <Card className="gap-0 p-0 md:col-span-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
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
              isLoading={ordersFetch.status === "loading"}
              error={ordersFetch.status === "failed" ? ordersFetch.error : null}
              onRetry={ordersFetch.retry}
              onRowClick={(order) => navigate(`/order_detail/${order.id}`)}
              showPagination={false}
              minWidth="600px"
              columnWidths={["130px", "160px", "100px", "120px", "120px"]}
              emptyTitle="No recent orders"
              emptyDescription="New incoming orders will appear here in real time."
              emptyIcon={ShoppingBag}
            />
          </div>
        </Card>

        {/* Progress Bar Top Products */}
        <Card className="p-5 md:col-span-4 justify-between">
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
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
