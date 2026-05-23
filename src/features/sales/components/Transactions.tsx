import { DownloadIcon } from "lucide-react"
import React from "react"
import { ActionButton } from "@/components/common/ActionButton"
import { TableActions } from "@/components/common/TableActions"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DatePicker } from "./DatePicker"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"

const Transactions = () => {
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
  type PaymentMethod = "card" | "paypal" | "stripe" | "cash"
  interface TransactionItem {
    id: string
    customer: string
    orderId: string
    paymentMethod: PaymentMethod
    amount: number
    status: TransactionStatus
    date: string
  }

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
          const confirmDelete = window.confirm(
            `Delete transaction ${transaction.id}?`,
          )

          if (confirmDelete) {
            console.log("Deleting:", transaction.id)
          }
        }

        return (
          <TableActions
            viewUrl={`/transaction_detail/${transaction.id}`}
            onDelete={handleDelete}
          />
        )
      },
    },
  ]

  const transactions: TransactionItem[] = [
    {
      id: "TXN1001",
      customer: "John Smith",
      orderId: "ORD5001",
      paymentMethod: "card",
      amount: 249.99,
      status: "paid",
      date: "2025-05-01 10:24 AM",
    },
    {
      id: "TXN1002",
      customer: "Emma Johnson",
      orderId: "ORD5002",
      paymentMethod: "paypal",
      amount: 89.5,
      status: "pending",
      date: "2025-05-01 11:12 AM",
    },
    {
      id: "TXN1003",
      customer: "Michael Brown",
      orderId: "ORD5003",
      paymentMethod: "stripe",
      amount: 520,
      status: "paid",
      date: "2025-05-02 09:18 AM",
    },
    {
      id: "TXN1004",
      customer: "Sophia Davis",
      orderId: "ORD5004",
      paymentMethod: "cash",
      amount: 45,
      status: "failed",
      date: "2025-05-02 02:41 PM",
    },
    {
      id: "TXN1005",
      customer: "Daniel Wilson",
      orderId: "ORD5005",
      paymentMethod: "card",
      amount: 1299.99,
      status: "paid",
      date: "2025-05-03 08:55 AM",
    },
    {
      id: "TXN1006",
      customer: "Olivia Martinez",
      orderId: "ORD5006",
      paymentMethod: "paypal",
      amount: 72.49,
      status: "refunded",
      date: "2025-05-03 01:30 PM",
    },
    {
      id: "TXN1007",
      customer: "William Anderson",
      orderId: "ORD5007",
      paymentMethod: "stripe",
      amount: 340,
      status: "paid",
      date: "2025-05-04 03:22 PM",
    },
    {
      id: "TXN1008",
      customer: "Ava Thomas",
      orderId: "ORD5008",
      paymentMethod: "card",
      amount: 15.99,
      status: "pending",
      date: "2025-05-04 06:40 PM",
    },
    {
      id: "TXN1009",
      customer: "James Taylor",
      orderId: "ORD5009",
      paymentMethod: "cash",
      amount: 230,
      status: "paid",
      date: "2025-05-05 10:05 AM",
    },
    {
      id: "TXN1010",
      customer: "Isabella Moore",
      orderId: "ORD5010",
      paymentMethod: "paypal",
      amount: 480,
      status: "failed",
      date: "2025-05-05 12:11 PM",
    },
    {
      id: "TXN1011",
      customer: "Benjamin Jackson",
      orderId: "ORD5011",
      paymentMethod: "card",
      amount: 999,
      status: "paid",
      date: "2025-05-06 09:44 AM",
    },
    {
      id: "TXN1012",
      customer: "Mia White",
      orderId: "ORD5012",
      paymentMethod: "stripe",
      amount: 67.8,
      status: "refunded",
      date: "2025-05-06 04:15 PM",
    },
    {
      id: "TXN1013",
      customer: "Lucas Harris",
      orderId: "ORD5013",
      paymentMethod: "cash",
      amount: 150,
      status: "paid",
      date: "2025-05-07 11:28 AM",
    },
    {
      id: "TXN1014",
      customer: "Charlotte Martin",
      orderId: "ORD5014",
      paymentMethod: "paypal",
      amount: 820,
      status: "pending",
      date: "2025-05-07 01:08 PM",
    },
    {
      id: "TXN1015",
      customer: "Henry Thompson",
      orderId: "ORD5015",
      paymentMethod: "card",
      amount: 39.99,
      status: "paid",
      date: "2025-05-08 08:18 AM",
    },
    {
      id: "TXN1016",
      customer: "Amelia Garcia",
      orderId: "ORD5016",
      paymentMethod: "stripe",
      amount: 270,
      status: "failed",
      date: "2025-05-08 05:47 PM",
    },
    {
      id: "TXN1017",
      customer: "Ethan Clark",
      orderId: "ORD5017",
      paymentMethod: "cash",
      amount: 560,
      status: "paid",
      date: "2025-05-09 10:55 AM",
    },
    {
      id: "TXN1018",
      customer: "Harper Lewis",
      orderId: "ORD5018",
      paymentMethod: "paypal",
      amount: 110,
      status: "refunded",
      date: "2025-05-09 02:14 PM",
    },
    {
      id: "TXN1019",
      customer: "Alexander Walker",
      orderId: "ORD5019",
      paymentMethod: "card",
      amount: 74.25,
      status: "pending",
      date: "2025-05-10 09:03 AM",
    },
    {
      id: "TXN1020",
      customer: "Ella Hall",
      orderId: "ORD5020",
      paymentMethod: "stripe",
      amount: 1499,
      status: "paid",
      date: "2025-05-10 07:20 PM",
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

        <ActionButton variant="download" icon={DownloadIcon}>
          Export CSV
        </ActionButton>
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
