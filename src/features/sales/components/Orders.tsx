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
import { exportToCSV } from "@/lib/ExportToCsv"
import type { OrderListItem, OrderStatus, PaymentStatus } from "@/features/sales/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/sales/slices/orderSlice"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { format } from "date-fns"
import { formatCurrency, formatDate } from "@/lib/format"

const PAGE_SIZE = 20

// Format a picked day as a local "YYYY-MM-DD" (not toISOString, which shifts to UTC).
const toLocalDay = (date: Date | undefined) => (date ? format(date, "yyyy-MM-dd") : undefined)

const Orders = () => {
  useDocumentTitle("Orders")

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: orders, isFetchingList, error, totalItems, meta } = useAppSelector((state) => state.orders)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<{ label: string; value: string } | null>(null)
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<{ label: string; value: string } | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Debounce typing so each keystroke doesn't fire a request.
  useEffect(() => {
    const next = search.trim()
    if (next === debouncedSearch) return
    const t = setTimeout(() => {
      setDebouncedSearch(next)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search, debouncedSearch])

  // Any filter change returns to page 1 (set in the change handlers, not an effect).
  const withPageReset = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  const dateFrom = toLocalDay(dateRange?.from)
  const dateTo = toLocalDay(dateRange?.to)

  // Filtering and pagination happen server-side: only the current page is ever loaded, so
  // client-side filtering would silently miss matches on other pages. Param names follow the
  // backend's django-filter conventions (search / status / payment_status / created date range).
  const loadOrders = useCallback(() => {
    return dispatch(
      fetchAll({
        page,
        page_size: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(paymentStatusFilter ? { payment_status: paymentStatusFilter.value } : {}),
        ...(fulfillmentStatusFilter ? { status: fulfillmentStatusFilter.value } : {}),
        ...(dateFrom ? { created_after: dateFrom } : {}),
        ...(dateTo ? { created_before: dateTo } : {}),
      })
    )
  }, [dispatch, page, debouncedSearch, paymentStatusFilter, fulfillmentStatusFilter, dateFrom, dateTo])

  useEffect(() => {
    const request = loadOrders()
    return () => request.abort()
  }, [loadOrders])

  const paymentStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Failed", value: "failed" },
    { label: "Partially Refunded", value: "partially_refunded" },
    { label: "Refunded", value: "refunded" },
  ]

  const fulfillmentStatusOptions = [
    { label: "Pending Payment", value: "pending_payment" },
    { label: "Placed", value: "placed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ]

  const columns: ColumnDef<OrderListItem>[] = [
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
        const customer = row.original.customer as OrderListItem["customer"] | null | undefined
        const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")
        return (
          <div>
            <p className="text-sm font-medium text-foreground">{name || customer?.email || "Guest"}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "total_amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(row.getValue("total_amount") as string)}
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
          {formatDate(row.getValue("created_at") as string)}
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

  // Exports the rows currently loaded (the visible page).
  const csvData = orders.map((order) => ({
    order_number: order.order_number,
    customer: order.customer?.email ?? "",
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
        datePicker={<DatePicker value={dateRange} onChange={withPageReset(setDateRange)} />}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={paymentStatusOptions}
                placeholder="Payment Status"
                value={paymentStatusFilter}
                onValueChange={withPageReset(setPaymentStatusFilter)}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={fulfillmentStatusOptions}
                placeholder="Fulfillment Status"
                value={fulfillmentStatusFilter}
                onValueChange={withPageReset(setFulfillmentStatusFilter)}
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isFetchingList}
          error={error}
          onRetry={() => {
            loadOrders()
          }}
          manualPagination
          pageSize={PAGE_SIZE}
          pageIndex={page - 1}
          pageCount={meta?.totalPages ?? 1}
          totalCount={totalItems}
          onPageChange={(index) => setPage(index + 1)}
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
