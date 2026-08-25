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
import type { ReturnRequest, ReturnStatus } from "@/features/returns/types"

const Returns = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: returns, isLoading, error } = useAppSelector((state) => state.returns)
  const { data: orders } = useAppSelector((state) => state.orders)

  const loadReturns = useCallback(() => {
    dispatch(fetchAllReturns())
  }, [dispatch])

  useEffect(() => {
    loadReturns()
    dispatch(fetchAllOrders({ page: 1, page_size: 100 }))
  }, [loadReturns, dispatch])

  const orderNumber = (orderId: string) => orders.find((o) => o.id === orderId)?.order_number ?? orderId

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
          {(row.getValue("reason") as string).replace("_", " ")}
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
          {new Date(row.getValue("created_at")).toLocaleDateString()}
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
