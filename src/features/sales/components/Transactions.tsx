import { DownloadIcon } from "lucide-react"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TableActions } from "@/components/common/TableActions"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DatePicker } from "./DatePicker"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { exportToCSV } from "@/utility/ExportToCsv"
import { type TransactionItem, type TransactionPaymentMethod } from "@/assets/Data"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/sales/slices/transactionSlice"
import { toast } from "sonner"

const Transactions = () => {
  const dispatch = useAppDispatch()
  const { data: transactions } = useAppSelector((state) => state.transactions)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])
  const statusOptions = [
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ]
  const statusStyles = {
    paid: "bg-green-500/10 text-green-400 border border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border border-red-500/20",
    refunded: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  } as const
  type TransactionStatus = keyof typeof statusStyles
  type PaymentMethod = TransactionPaymentMethod

  const columns: ColumnDef<TransactionItem>[] = [
    {
      accessorKey: "id",
      header: "TRANSACTION ID",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">
          {row.getValue("id")}
        </span>
      ),
    },

    {
      accessorKey: "customer",
      header: "CUSTOMER",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("customer")}
        </span>
      ),
    },

    {
      accessorKey: "orderId",
      header: "ORDER ID",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("orderId")}
        </span>
      ),
    },

    {
      accessorKey: "paymentMethod",
      header: "PAYMENT METHOD",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as PaymentMethod

        return (
          <span className="capitalize text-sm text-foreground">{method}</span>
        )
      },
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
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as TransactionStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
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
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("date")}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const transaction = row.original

        const handleDelete = () => {
          dispatch(deleteData(transaction.id))
          toast.success(`Transaction ${transaction.id} deleted`)
        }

        return (
          <TableActions
            itemName={`Transaction ${transaction.id}`}
            viewUrl={`/transaction_detail/${transaction.id}`}
            onDelete={handleDelete}
          />
        )
      },
    },
  ]

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Transactions
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Monitor and manage all customer payment activities.
          </p>
        </div>

        <Button
          variant="primary"
          size="action"
          onClick={() => exportToCSV(transactions, "Transactions")}
        >
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      <FilterToolbar
        searchPlaceholder="search transaction..."
        filters={[
          {
            component: <DatePicker />,
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="Payment Statues"
                frameworks={statusOptions}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={transactions}
        columnWidths={[
          "140px", // TRANSACTION ID
          "220px", // CUSTOMER
          "140px", // ORDER ID
          "160px", // PAYMENT METHOD
          "120px", // AMOUNT
          "120px", // STATUS
          "180px", // DATE
          "100px", // ACTION
        ]}
      />
    </div>
  )
}

export default Transactions
