import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/common/data-table"
import { TableActions } from "@/components/common/TableActions"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAllReturns } from "@/features/returns/slices/returnSlice"
import { fetchAll as fetchAllOrders } from "@/features/sales/slices/orderSlice"
import type { ReturnRequest, ReturnStatus } from "@/features/returns/types"

const statusStyles: Partial<Record<ReturnStatus, string>> = {
  pending_review: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  rejected: "bg-red-500/10 text-red-500 border border-red-500/20",
  refunded: "bg-green-500/10 text-green-500 border border-green-500/20",
  replaced: "bg-green-500/10 text-green-500 border border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
}

const Returns = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: returns } = useAppSelector((state) => state.returns)
  const { data: orders } = useAppSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchAllReturns())
    dispatch(fetchAllOrders({ page: 1, page_size: 100 }))
  }, [dispatch])

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
      cell: ({ row }) => {
        const status = row.getValue("status") as ReturnStatus
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[status] ?? "bg-gray-500/10 text-gray-500 border border-gray-500/20"
            }`}
          >
            {status.replace("_", " ")}
          </span>
        )
      },
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
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Returns</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review and process customer return requests
        </p>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        onRowClick={(ret) => navigate(`/return_detail/${ret.id}`)}
        showPagination={false}
        minWidth="950px"
        columnWidths={["140px", "140px", "130px", "140px", "130px", "100px"]}
      />

    </div>
  )
}

export default Returns
