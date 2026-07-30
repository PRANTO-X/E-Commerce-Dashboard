import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import type { Coupon } from "@/features/marketing/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/marketing/slices/couponSlice"
import { toast } from "sonner"

const Coupons = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: allCoupons } = useAppSelector((state) => state.coupons)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  const coupons = allCoupons.filter((coupon) => {
    if (search && !coupon.code.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && coupon.is_active !== (statusFilter.value === "active")) return false
    return true
  })

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "CODE",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-primary">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "discount_type",
      header: "TYPE",
      cell: ({ row }) => (
        <span className="text-sm text-foreground capitalize">
          {(row.getValue("discount_type") as string).replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "discount_value",
      header: "VALUE",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <span className="text-sm font-medium text-foreground">
            {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
          </span>
        )
      },
    },
    {
      id: "usage",
      header: "USAGE",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <span className="text-sm text-muted-foreground">
            {coupon.usage_count} / {coupon.max_usage_count ?? "∞"}
          </span>
        )
      },
    },
    {
      accessorKey: "valid_until",
      header: "EXPIRES",
      cell: ({ row }) => {
        const value = row.getValue("valid_until") as string | null
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {value ? new Date(value).toLocaleDateString() : "Never"}
          </span>
        )
      },
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
          {row.getValue("is_active") ? "active" : "inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const coupon = row.original
        const handleDelete = async () => {
          try {
            await dispatch(deleteData(coupon.id)).unwrap()
            toast.success(`Coupon ${coupon.code} deleted`)
          } catch {
            toast.error("Failed to delete coupon")
          }
        }
        return (
          <TableActions
            itemName={coupon.code}
            onDelete={handleDelete}
            editUrl={`/coupon_form/${coupon.id}`}
          />
        )
      },
    },
  ]

  const csvData = coupons.map((c) => ({
    code: c.code,
    type: c.discount_type,
    value: c.discount_value,
    used: c.usage_count,
    limit: c.max_usage_count,
    expires: c.valid_until,
    active: c.is_active,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Coupons & Vouchers</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Create and manage discount codes and usage limits.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="default" size="action" onClick={() => navigate("/coupon_form/new")}>
            <PlusIcon className="size-5" /> Add Coupon
          </Button>
          <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Coupons")}>
            <DownloadIcon className="size-5" /> Export CSV
          </Button>
        </div>
      </div>

      <FilterToolbar
        searchPlaceholder="search coupon code..."
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
                placeholder="status"
                frameworks={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={coupons}
        columnWidths={["140px", "140px", "100px", "120px", "140px", "120px", "100px"]}
      />
    </div>
  )
}

export default Coupons
