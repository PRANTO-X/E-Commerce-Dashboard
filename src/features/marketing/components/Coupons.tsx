import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { type Coupon } from "@/assets/Data"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/marketing/slices/couponSlice"
import { toast } from "sonner"

const statusStyles = {
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  expired: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  disabled: "bg-red-500/10 text-red-400 border border-red-500/20",
} as const

const typeLabels = {
  percent: "Percentage",
  fixed: "Fixed Amount",
  free_shipping: "Free Shipping",
} as const

const Coupons = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: coupons } = useAppSelector((state) => state.coupons)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Expired", value: "expired" },
    { label: "Disabled", value: "disabled" },
  ]

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
      accessorKey: "type",
      header: "TYPE",
      cell: ({ row }) => {
        const type = row.getValue("type") as Coupon["type"]
        return <span className="text-sm text-foreground">{typeLabels[type]}</span>
      },
    },
    {
      accessorKey: "value",
      header: "VALUE",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <span className="text-sm font-medium text-foreground">
            {coupon.type === "percent" ? `${coupon.value}%` : coupon.type === "fixed" ? `$${coupon.value}` : "—"}
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
            {coupon.usedCount} / {coupon.usageLimit}
          </span>
        )
      },
    },
    {
      accessorKey: "expiryDate",
      header: "EXPIRES",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.getValue("expiryDate")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as Coupon["status"]
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const coupon = row.original
        const handleDelete = () => {
          dispatch(deleteData(coupon.id))
          toast.success(`Coupon ${coupon.code} deleted`)
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
    type: c.type,
    value: c.value,
    used: c.usedCount,
    limit: c.usageLimit,
    expiry: c.expiryDate,
    status: c.status,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Coupons & Vouchers</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Create and manage discount codes, free-shipping vouchers, and usage limits.
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
        filters={[
          {
            component: <ExampleComboboxCustomItems placeholder="status" frameworks={statusOptions} />,
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
