import { Button } from "@/components/ui/button"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { TableActions } from "@/components/common/TableActions"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { DownloadIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/users/slices/customerSlice"
import type { AdminUser } from "@/features/users/types"

const status = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const Customers = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: users, isLoading, error } = useAppSelector((state) => state.customers)
  const allCustomers = users.filter((u) => u.role === "customer")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  const loadCustomers = useCallback(() => {
    dispatch(fetchAll())
  }, [dispatch])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

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
        <StatusBadge status={row.getValue("is_active") ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <TableActions
          itemName={[row.original.first_name, row.original.last_name].filter(Boolean).join(" ") || row.original.email}
          viewUrl={`/customer_detail/${row.original.id}`}
        />
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
        <PageHeading
          title="Customers"
          description="Manage your registered customer accounts."
        />

        <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Customers")}>
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      <FilterToolbar
        searchPlaceholder="Search customer..."
        searchValue={search}
        onSearchChange={setSearch}
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
          isLoading={isLoading}
          error={error}
          onRetry={loadCustomers}
          onRowClick={(customer) => navigate(`/customer_detail/${customer.id}`)}
          minWidth="900px"
          columnWidths={["280px", "160px", "140px", "120px", "100px"]}
        />
      </div>
    </div>
  )
}

export default Customers
