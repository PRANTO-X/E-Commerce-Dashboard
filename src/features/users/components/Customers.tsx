import { Button } from "@/components/ui/button"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, EyeIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/users/slices/customerSlice"
import type { AdminUser } from "@/features/users/types"

const status = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const Customers = () => {
  const dispatch = useAppDispatch()
  const { data: users, isLoading } = useAppSelector((state) => state.customers)
  const allCustomers = users.filter((u) => u.role === "customer")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const customers = allCustomers.filter((customer) => {
    if (search) {
      const q = search.toLowerCase()
      const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").toLowerCase()
      if (!name.includes(q) && !customer.email.toLowerCase().includes(q)) return false
    }
    if (statusFilter && customer.is_active !== (statusFilter.value === "active")) return false
    return true
  })

  const columns: ColumnDef<AdminUser>[] = [
    {
      id: "customer",
      header: "CUSTOMER",
      cell: ({ row }) => {
        const customer = row.original
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {customer.profile_picture ? (
                <img src={customer.profile_picture} alt={name} className="h-full w-full object-cover" />
              ) : (
                (name || customer.email).charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{name || "—"}</span>
              <span className="text-xs text-muted-foreground">{customer.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "PHONE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("phone") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "is_email_verified",
      header: "EMAIL VERIFIED",
      cell: ({ row }) => (row.getValue("is_email_verified") ? "Yes" : "No"),
    },
    {
      accessorKey: "is_active",
      header: "STATUS",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.getValue("is_active")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <Link to={`/customer_detail/${row.original.id}`} className="ml-1 flex items-center gap-1 text-xs text-primary">
          <EyeIcon className="size-3.5" /> View
        </Link>
      ),
    },
  ]

  const csvData = customers.map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(" "),
    email: c.email,
    phone: c.phone,
    active: c.is_active,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage your registered customer accounts.
          </p>
        </div>

        <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Customers")}>
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      <FilterToolbar
        searchPlaceholder="Search customer..."
        searchValue={search}
        onSearchChange={setSearch}
        onReset={() => {
          setSearch("")
          setStatusFilter(null)
        }}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={status}
                placeholder="Status"
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={customers}
          columnWidths={["280px", "160px", "140px", "120px", "100px"]}
        />
      </div>
      {!isLoading && customers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No customer accounts yet.</p>
      )}
    </div>
  )
}

export default Customers
