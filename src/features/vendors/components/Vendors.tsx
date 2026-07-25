import { Button } from "@/components/ui/button"
import { DownloadIcon, EyeIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { Link } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { type Vendor } from "@/assets/Data"
import { useAppData } from "@/store/AppDataProvider"

const statusStyles = {
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  suspended: "bg-red-500/10 text-red-400 border border-red-500/20",
  rejected: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
} as const

const Vendors = () => {
  const { vendors } = useAppData()

  const statusOptions = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
    { label: "Rejected", value: "rejected" },
  ]

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: "VENDOR",
      cell: ({ row }) => {
        const vendor = row.original
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{vendor.name}</span>
            <span className="text-xs text-muted-foreground">{vendor.email}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "commissionRate",
      header: "COMMISSION",
      cell: ({ row }) => <span className="text-sm font-medium">{row.getValue("commissionRate")}%</span>,
    },
    {
      accessorKey: "totalProducts",
      header: "PRODUCTS",
      cell: ({ row }) => <span className="text-sm">{row.getValue("totalProducts")}</span>,
    },
    {
      accessorKey: "totalSales",
      header: "TOTAL SALES",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">${(row.getValue("totalSales") as number).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "payoutBalance",
      header: "PAYOUT BALANCE",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">${(row.getValue("payoutBalance") as number).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: "JOINED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">{row.getValue("joinedAt")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as Vendor["status"]
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
      cell: ({ row }) => (
        <Link to={`/vendor_detail/${row.original.id}`} className="ml-1 flex items-center gap-1 text-xs text-primary">
          <EyeIcon className="size-3.5" /> View
        </Link>
      ),
    },
  ]

  const csvData = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    email: v.email,
    status: v.status,
    commission: v.commissionRate,
    products: v.totalProducts,
    sales: v.totalSales,
    payout_balance: v.payoutBalance,
    joined: v.joinedAt,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Vendors</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Review vendor applications and manage marketplace sellers.
          </p>
        </div>

        <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Vendors")}>
          <DownloadIcon className="size-5" /> Export CSV
        </Button>
      </div>

      <FilterToolbar
        searchPlaceholder="search vendor..."
        filters={[
          {
            component: <ExampleComboboxCustomItems placeholder="status" frameworks={statusOptions} />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={vendors}
        columnWidths={["240px", "130px", "110px", "130px", "150px", "140px", "120px", "90px"]}
      />
    </div>
  )
}

export default Vendors
