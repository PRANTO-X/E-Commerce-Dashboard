import { useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { TableActions } from "@/components/common/TableActions"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAllPayments } from "@/features/payments/slices/paymentSlice"
import type { Payment, PaymentTransactionState } from "@/features/payments/types"

const Payments = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: payments, isLoading, error } = useAppSelector((state) => state.payments)

  const loadPayments = useCallback(() => {
    dispatch(fetchAllPayments())
  }, [dispatch])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as PaymentTransactionState} />
      ),
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
        <TableActions
          itemName={`Payment for Order ${(row.getValue("order") as Payment["order"]).order_number}`}
          viewUrl={`/payment_detail/${row.original.id}`}
        />
      ),
    },
  ]

  return (
    <div className="section-container">
      <PageHeading
        title="Payments"
        description="Track payment transactions and process refunds"
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        error={error}
        onRetry={loadPayments}
        onRowClick={(payment) => navigate(`/payment_detail/${payment.id}`)}
        showPagination={false}
        minWidth="950px"
        columnWidths={["150px", "150px", "150px", "120px", "180px", "100px"]}
      />

    </div>
  )
}

export default Payments
