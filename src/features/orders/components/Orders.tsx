import React from "react"
import { DatePicker } from "./DatePicker"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { DownloadIcon, EyeIcon } from "lucide-react"
import { Link } from "react-router-dom"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ActionButton } from "@/components/common/ActionButton"


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
  

  const paymentStatusStyle ={
    Paid: "bg-green-500/10 text-green-500",
    Pending: "bg-yellow-500/10 text-yellow-500",
    Failed: "bg-red-500/10 text-red-500",
    Refunded: "bg-purple-500/10 text-purple-500",
  } as const

  type PaymentStatus = keyof typeof paymentStatusStyle;

  const fulfillmentStatusStyles = {
    Shipped: "bg-green-500/10 text-green-500",
    Processing: "bg-blue-500/10 text-blue-500",
    Cancelled: "bg-red-500/10 text-red-500",
    Delivered: "bg-emerald-500/10 text-emerald-500",
    Unfulfilled: "bg-gray-500/10 text-gray-500",
  } as const
  
  type FulfillmentStatus = keyof typeof fulfillmentStatusStyles

  interface Order {
    id: string
    customer: string
    product: string
    amount: number
    paymentStatus: PaymentStatus
    fulfillmentStatus: FulfillmentStatus
    date: string
  }
  
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "ORDER ID",
      cell: ({ row }) => (
        <span className="font-inter text-sm font-medium text-primary">
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
        ) as PaymentStatus
        return (
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${paymentStatusStyle[status]}"}`}
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
        ) as FulfillmentStatus
        return (
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${fulfillmentStatusStyles[status]}"}`}
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
    <div className="section-container">
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

        <ActionButton variant="download" icon={DownloadIcon}>Export CSV</ActionButton>
      </div>

      {/* Filters */}
      <FilterToolbar
        searchPlaceholder="Search Orders..."
        datePicker = {<DatePicker/>}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={paymentStatus}
                placeholder="Payment Status"
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={fulfillmentStatus}
                placeholder="Fulfillment Status"
              />
            ),
          },
        ]}
        onApply={() => console.log("apply")}
        onReset={() => console.log("reset")}
      />

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
