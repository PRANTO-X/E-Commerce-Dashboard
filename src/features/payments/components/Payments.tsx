import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { EyeIcon } from "lucide-react"
import { DataTable } from "@/components/common/data-table"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAllPayments } from "@/features/payments/slices/paymentSlice"
import type { Payment, PaymentTransactionState } from "@/features/payments/types"

const statusStyles: Record<PaymentTransactionState, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  succeeded: "bg-green-500/10 text-green-500 border border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
}

const Payments = () => {
  const dispatch = useAppDispatch()
  const { data: payments } = useAppSelector((state) => state.payments)

  useEffect(() => {
    dispatch(fetchAllPayments())
  }, [dispatch])

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "order",
      header: "ORDER",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">
          {(row.getValue("order") as Payment["order"]).order_number}
        </span>
      ),
    },
    {
      accessorKey: "provider",
      header: "PROVIDER",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {(row.getValue("provider") as string).replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          {row.original.currency} {Number(row.getValue("amount")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as PaymentTransactionState
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <Link to={`/payment_detail/${row.original.id}`} className="ml-1 text-xs text-primary flex gap-1">
          <EyeIcon className="h-3.5 w-3.5" />
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Payments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track payment transactions and process refunds
        </p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        showPagination={false}
        columnWidths={["150px", "150px", "150px", "120px", "180px", "100px"]}
      />

    </div>
  )
}

export default Payments
