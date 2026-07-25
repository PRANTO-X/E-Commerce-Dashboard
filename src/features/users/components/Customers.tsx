import { Button } from "@/components/ui/button"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, EyeIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import React from "react"
import { Link } from "react-router-dom"
import { type Customer } from "@/assets/Data"
import  { exportToCSV } from "@/utility/ExportToCsv"
import { useAppData } from "@/store/AppDataProvider"

const Customers = () => {
  const { customers } = useAppData()
  const statusStyles = {
    Active: "bg-green-500/10 text-green-400 border border-green-500/20",
    Inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
    
  } as const

  type CustomerStatus = keyof typeof statusStyles

  const status = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "CUSTOMER ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },

    {
      accessorKey: "name",
      header: "CUSTOMER",
      cell: ({ row }) => {
        const customer = row.original

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                customer.name.charAt(0)
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {customer.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {customer.email}
              </span>
            </div>
          </div>
        )
      },
    },

    {
      accessorKey: "phone",
      header: "PHONE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("phone") || "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "totalOrders",
      header: "ORDERS",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("totalOrders")}
        </span>
      ),
    },

    {
      accessorKey: "totalSpent",
      header: "TOTAL SPENT",
      cell: ({ row }) => {
        const amount = row.getValue("totalSpent") as number

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
        const status = row.getValue("status") as CustomerStatus

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
      accessorKey: "createdAt",
      header: "JOINED",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("createdAt")}
        </span>
      ),
    },

    {
      accessorKey: "lastOrderAt",
      header: "LAST ORDER",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("lastOrderAt") || "No Orders"}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const customer = row.original

        return (
          <Link to={`/customer_detail/${customer.id}`} className="ml-1 flex items-center gap-1 text-xs text-primary">
            <EyeIcon className="size-3.5" /> View
          </Link>
        )
      },
    },
  ]

  const csvData = customers.map((customer)=>({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    orders: customer.totalOrders,
    spent: customer.totalSpent,
    status: customer.status,
    joined: customer.createdAt,
    last_order: customer.lastOrderAt,
  }))

  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Customers
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage and analyze your enterprise client database.
          </p>
        </div>

        <Button variant="primary" size="action" onClick={()=> exportToCSV(csvData,"Customers")}>
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      {/* Filter */}
      <FilterToolbar
        searchPlaceholder="Search customer..."
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={status}
                placeholder="Status"
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={customers}
          columnWidths={[
            "120px",
            "260px",
            "160px",
            "100px",
            "140px",
            "130px",
            "140px",
            "140px",
            "100px",
          ]}
        />
      </div>
    </div>
  )
}

export default Customers
