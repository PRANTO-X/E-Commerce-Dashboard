import { useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { TableActions } from "@/components/common/TableActions"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAllReturns } from "@/features/returns/slices/returnSlice"
import { fetchAll as fetchAllOrders } from "@/features/sales/slices/orderSlice"
import { useLocalFetch } from "@/features/analytics/useLocalFetch"
import { formatDate, humanize } from "@/lib/format"
import type { ReturnRequest, ReturnStatus } from "@/features/returns/types"
import { useDocumentTitle } from "@/hooks/use-document-title"

const Returns = () => {
  useDocumentTitle("Returns")

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: returns, isLoading, error } = useAppSelector((state) => state.returns)

  const loadReturns = useCallback(() => {
    dispatch(fetchAllReturns())
  }, [dispatch])

  useEffect(() => {
    loadReturns()
  }, [loadReturns])

  // Order numbers for display, from a local fetch so we don't depend on (or rely on) whatever
  // page of orders the orders slice currently holds. Orders outside this page fall back to the id.
  const startOrders = useCallback(() => dispatch(fetchAllOrders({ page: 1, page_size: 100 })), [dispatch])
  const { data: orderPage } = useLocalFetch(startOrders)
  const orderNumber = (orderId: string) =>
    orderPage?.data.find((o) => o.id === orderId)?.order_number ?? orderId

  const columns: ColumnDef<ReturnRequest>[] = [
    {
      accessorKey: "return_number",
      header: "RETURN #",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">{row.getValue("return_number")}</span>
      ),
    },
    {
      accessorKey: "order",
      header: "ORDER",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{orderNumber(row.getValue("order"))}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: "REASON",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {humanize(row.getValue("reason") as string)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as ReturnStatus} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "REQUESTED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.getValue("created_at") as string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <TableActions
          itemName={`Return ${row.original.return_number}`}
          viewUrl={`/return_detail/${row.original.id}`}
        />
      ),
    },
  ]

  return (
    <div className="section-container">
      <PageHeading
        title="Returns"
        description="Review and process customer return requests"
      />

      <DataTable
        columns={columns}
        data={returns}
        isLoading={isLoading}
        error={error}
        onRetry={loadReturns}
        onRowClick={(ret) => navigate(`/return_detail/${ret.id}`)}
        showPagination={false}
        minWidth="950px"
        columnWidths={["140px", "140px", "130px", "140px", "130px", "100px"]}
      />

    </div>
  )
}

export default Returns
