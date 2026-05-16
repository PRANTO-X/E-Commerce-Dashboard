import React from "react"
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"
import { ChartAreaDefault } from "./AreaChart"
import { DataTable } from "@/components/common/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ProgressBar } from "./ProgressBar"
import { Link } from "react-router-dom"
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
  type OrderStatus = "Paid" | "Pending" | "Failed"

  type Order = {
    id: string
    customer: string
    amount: string
    status: OrderStatus
    date: string
  }

  const statusStyles: Record<OrderStatus, string> = {
    Paid: "bg-green-500/10 text-green-400 border border-green-500/20",
    Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.getValue("customer")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("amount")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as OrderStatus
        return (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
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
    <div className="px-4 py-6 md:px-8 md:py-8 mx-auto space-y-4">
      
      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl  font-bold">
            Overview
          </h1>
          <p className="font-text text-accent-foreground text-sm">
            Real-time performance metrics for your enterprise.
          </p>
        </div>

        <div className="space-x-2.5">
          <button className="bg-popover hover:bg-accent transition duration-300  border border-border py-2 px-3 rounded-lg cursor-pointer">
            Download Report
          </button>
          <button className="bg-accent border hover:bg-primary transition duration-300 border-primary py-2 px-3 rounded-lg cursor-pointer">
            Create New Order
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      {/* Chart Area */}
      <div>
        <ChartAreaDefault />
      </div>

        {/* Table & ProgressBar  */}
      <div className=" grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Order Table */}
        <div className="rounded-xl border border-border bg-card md:col-span-8">
          <div className="flex items-center justify-between py-4 px-5">
            <h2 className="font-geist text-xl md:text-2xl font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link to={'/orders'} className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <DataTable columns={columns} data={recentOrders} />
        </div>

        {/* Progress Bar */}
        <div className="rounded-xl border border-border bg-card md:col-span-4 p-5">
          <h2 className="font-geist text-xl md:text-2xl font-semibold text-foreground mb-4">
              Top Orders
            </h2>
          <div className="flex flex-col gap-4 w-full">
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
