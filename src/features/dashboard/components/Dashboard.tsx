import { ShoppingCart, Users, Package, DollarSign } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"
import { ChartAreaDefault } from "./AreaChart"
import { DataTable } from "@/components/common/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ProgressBar } from "./ProgressBar"
import { Link } from "react-router-dom"

const statusStyles = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-500",
  Pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-500",
  Failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-500",
} as const

const Dashboard = () => {
  const metrics = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: "$128,430",
      change: +12.5,
      icon: DollarSign,
    },
    {
      id: "orders",
      title: "Orders Today",
      value: "1,240",
      change: +8.2,
      icon: ShoppingCart,
    },
    {
      id: "customers",
      title: "Active Customers",
      value: "45,210",
      change: +2.4,
      icon: Users,
    },
    {
      id: "inventory",
      title: "Inventory Value",
      value: "$842k",
      change: -1.5,
      icon: Package,
    },
  ]

  type Order = {
    id: string
    customer: string
    amount: string
    status: keyof typeof statusStyles
    date: string
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary-500">
          {row.getValue("id")}
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
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
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
  ]
  const recentOrders: Order[] = [
    {
      id: "#ORD-2849",
      customer: "Marcus Aurelius",
      amount: "$1,240.00",
      status: "Paid",
      date: "Oct 24, 2023",
    },
    {
      id: "#ORD-2848",
      customer: "Cassius Dio",
      amount: "$840.50",
      status: "Pending",
      date: "Oct 24, 2023",
    },
    {
      id: "#ORD-2847",
      customer: "Seneca Younger",
      amount: "$3,100.00",
      status: "Paid",
      date: "Oct 23, 2023",
    },
    {
      id: "#ORD-2846",
      customer: "Cato Major",
      amount: "$450.00",
      status: "Failed",
      date: "Oct 23, 2023",
    },
    {
      id: "#ORD-2845",
      customer: "Cicero Tullius",
      amount: "$1,990.00",
      status: "Paid",
      date: "Oct 22, 2023",
    },
  ]
  type Product = {
    name: string
    percentage: number
  }

  const topProducts: Product[] = [
    { name: "Neural Core Processor v2", percentage: 84 },
    { name: "Quantum Interface Module", percentage: 67 },
    { name: "Cloud Sync Array", percentage: 52 },
    { name: "Data Shield Pro", percentage: 39 },
    { name: "Biometric Gateway", percentage: 21 },
  ]
  return (
    <div className="section-container">
      <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time performance metrics for your store.
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
          <div className="flex items-center justify-between px-5 py-4">
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
              showPagination={false}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 md:col-span-4 dark:border-[#16312b] dark:bg-[#0b1a17]">
          <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Top Products
          </h2>
          <div className="flex w-full flex-col gap-4">
            {topProducts.map((product) => (
              <ProgressBar
                key={product.name}
                label={product.name}
                value={product.percentage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
