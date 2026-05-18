import React from "react"
import { DatePicker } from "./DatePicker"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { EyeIcon } from "lucide-react"
import { Link } from "react-router-dom"

const Orders = () => {
  const paymentStatus = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
    { label: "Partially Refunded", value: "partially_refunded" },
  ]

  const fulfillmentStatus = [
    { label: "Unfulfilled", value: "unfulfilled" },
    { label: "Processing", value: "processing" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "In Transit", value: "in_transit" },
    { label: "Delivered", value: "delivered" },
    { label: "Returned", value: "returned" },
  ]
  interface Order {
    id: string
    customer: string
    product: string
    amount: number
    paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded"
    fulfillmentStatus:
      | "Shipped"
      | "Processing"
      | "Cancelled"
      | "Delivered"
      | "Unfulfilled"
      | "Returned"
    date: string
  }

  const statusStyles = {
    Paid: "bg-green-500/10 text-green-500",
    Pending: "bg-yellow-500/10 text-yellow-500",
    Failed: "bg-red-500/10 text-red-500",
    Refunded: "bg-purple-500/10 text-purple-500",
    Shipped: "bg-green-500/10 text-green-500",
    Processing: "bg-blue-500/10 text-blue-500",
    Cancelled: "bg-red-500/10 text-red-500",
    Delivered: "bg-emerald-500/10 text-emerald-500",
    Unfulfilled: "bg-gray-500/10 text-gray-500",
  } as const

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "ORDER ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "CUSTOMER",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">
            {row.getValue("customer")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm text-foreground line-clamp-1">
          {row.getValue("product")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number
        return (
          <span className="text-sm font-semibold text-foreground">
            ${amount.toFixed(2)}
          </span>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "PAYMENT",
      cell: ({ row }) => {
        const status = row.getValue(
          "paymentStatus",
        ) as keyof typeof statusStyles
        return (
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${statusStyles[status] || "bg-gray-500/10 text-gray-500"}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "fulfillmentStatus",
      header: "FULFILLMENT",
      cell: ({ row }) => {
        const status = row.getValue(
          "fulfillmentStatus",
        ) as keyof typeof statusStyles
        return (
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${statusStyles[status] || "bg-gray-500/10 text-gray-500"}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.getValue("date")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const order = row.original
        return (
          <Link
            to={`/order_detail/${order.id}`}
            className="ml-1 text-xs text-primary flex gap-1"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            View
          </Link>
        )
      },
    },
  ]

  const ordersData: Order[] = [
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
    {
      id: "ORD-0012",
      customer: "Helena Hills",
      product: "Cloud Core Subscription",
      amount: 299.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "ORD-0013",
      customer: "James Wilson",
      product: "API Gateway Pro",
      amount: 850.0,
      paymentStatus: "Pending",
      fulfillmentStatus: "Processing",
      date: "Oct 23, 2023",
    },
    {
      id: "ORD-0014",
      customer: "Aria Zhang",
      product: "Enterprise Support Plan",
      amount: 1200.0,
      paymentStatus: "Failed",
      fulfillmentStatus: "Cancelled",
      date: "Oct 22, 2023",
    },
    {
      id: "ORD-0015",
      customer: "Marcus Reed",
      product: "Network Monitoring Suite",
      amount: 45.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 21, 2023",
    },
    {
      id: "ORD-0016",
      customer: "Sonia K.",
      product: "Custom Domain Module",
      amount: 12.0,
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      date: "Oct 20, 2023",
    },
  ]

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Orders
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Monitor and manage all customer transactions.
          </p>
        </div>

        <button className="btn whitespace-nowrap">Export CSV</button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="search"
              className="h-11 w-full rounded-xl border border-border bg-transparent px-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* Date */}
          <div>
            <DatePicker />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* Payment */}
          <div className="w-auto">
            <ExampleComboboxCustomItems
              frameworks={paymentStatus}
              placeholder="Payment Status"
            />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* Fulfillment */}
          <div className="w-auto">
            <ExampleComboboxCustomItems
              frameworks={fulfillmentStatus}
              placeholder="Fulfillment Status"
            />
          </div>

          {/* Buttons */}
          <div className="ml-auto flex items-center gap-3">
            <button className="apply-btn h-11 px-6">Apply</button>

            <button className="reset-btn h-11 px-6">Reset</button>
          </div>
        </div>

        {/* Tablet + Mobile */}
        <div className="grid grid-cols-1 gap-3 xl:hidden">
          {/* Search */}
          <input
            type="text"
            placeholder="search"
            className="h-11 w-full rounded-xl border border-border bg-transparent px-4 text-sm outline-none transition-all focus:border-primary "
          />

          {/* Date */}
          <DatePicker />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ExampleComboboxCustomItems
              frameworks={paymentStatus}
              placeholder="Filter Payment Status"
            />

            <ExampleComboboxCustomItems
              frameworks={fulfillmentStatus}
              placeholder="Filter Fulfillment Status"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="apply-btn h-11 w-full">Apply</button>

            <button className="reset-btn h-11 w-full">Reset</button>
          </div>
        </div>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={ordersData}
          columnWidths={[
            "120px",
            "150px",
            "200px",
            "110px",
            "120px",
            "130px",
            "120px",
            "90px",
          ]}
        />
      </div>
    </div>
  )
}

export default Orders
