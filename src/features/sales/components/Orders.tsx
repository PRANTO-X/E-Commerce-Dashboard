import { useEffect, useState, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { DatePicker } from "./DatePicker"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { DownloadIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import FilterToolbar from "@/components/common/FilterToolBar"
import { TableActions } from "@/components/common/TableActions"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/utility/ExportToCsv"
import type { OrderDetail, OrderStatus, PaymentStatus } from "@/features/sales/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/sales/slices/orderSlice"

const Orders = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: orders, isLoading, error } = useAppSelector((state) => state.orders)

  const [search, setSearch] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<{ label: string; value: string } | null>(null)
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<{ label: string; value: string } | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const loadOrders = useCallback(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filteredOrders = orders.filter((order) => {
    if (
      search &&
      !order.order_number.toLowerCase().includes(search.toLowerCase()) &&
      !order.customer.email.toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (paymentStatusFilter && order.payment_status !== paymentStatusFilter.value) return false
    if (fulfillmentStatusFilter && order.status !== fulfillmentStatusFilter.value) return false
    if (dateRange?.from || dateRange?.to) {
      const created = new Date(order.created_at)
      if (dateRange.from && created < dateRange.from) return false
      if (dateRange.to && created > dateRange.to) return false
    }
    return true
  })

  const paymentStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ]

  const fulfillmentStatusOptions = [
    { label: "Placed", value: "placed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ]

  const columns: ColumnDef<OrderDetail>[] = [
    {
      accessorKey: "order_number",
      header: "ORDER #",
      cell: ({ row }) => (
        <span className="font-inter text-sm font-medium text-primary">
          {row.getValue("order_number")}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "CUSTOMER",
      cell: ({ row }) => {
        const customer = row.getValue("customer") as OrderDetail["customer"]
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
        return (
          <div>
            <p className="text-sm font-medium text-foreground">{name || customer.email}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "total_amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          ${Number(row.getValue("total_amount")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "PAYMENT",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("payment_status") as PaymentStatus} />
      ),
    },
    {
      accessorKey: "status",
      header: "FULFILLMENT",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as OrderStatus} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const order = row.original
        return (
          <TableActions
            itemName={`Order ${order.order_number}`}
            viewUrl={`/order_detail/${order.id}`}
          />
        )
      },
    },
  ]

  const csvData = filteredOrders.map((order) => ({
    order_number: order.order_number,
    customer: order.customer.email,
    total: order.total_amount,
    payment_status: order.payment_status,
    status: order.status,
    date: order.created_at,
  }))

  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeading
          title="Orders"
          description="Monitor and manage all customer transactions."
        />

        <Button
          variant="primary"
          size="action"
          onClick={() => exportToCSV(csvData, "Orders")}
        >
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <FilterToolbar
        searchPlaceholder="Search Orders..."
        searchValue={search}
        onSearchChange={setSearch}
        datePicker={<DatePicker value={dateRange} onChange={setDateRange} />}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={paymentStatusOptions}
                placeholder="Payment Status"
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={fulfillmentStatusOptions}
                placeholder="Fulfillment Status"
                value={fulfillmentStatusFilter}
                onValueChange={setFulfillmentStatusFilter}
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          error={error}
          onRetry={loadOrders}
          onRowClick={(order) => navigate(`/order_detail/${order.id}`)}
          minWidth="1050px"
          columnWidths={[
            "140px",
            "180px",
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
