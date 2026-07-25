import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { type Campaign } from "@/assets/Data"
import { useAppData } from "@/store/AppDataProvider"
import { toast } from "sonner"

const statusStyles = {
  draft: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  ended: "bg-red-500/10 text-red-400 border border-red-500/20",
} as const

const typeLabels = {
  flash_sale: "Flash Sale",
  mega_event: "Mega Event",
  seasonal: "Seasonal",
} as const

const Campaigns = () => {
  const navigate = useNavigate()
  const { campaigns, deleteCampaign } = useAppData()

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Active", value: "active" },
    { label: "Ended", value: "ended" },
  ]

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "name",
      header: "CAMPAIGN",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "TYPE",
      cell: ({ row }) => {
        const type = row.getValue("type") as Campaign["type"]
        return <span className="text-sm text-muted-foreground">{typeLabels[type]}</span>
      },
    },
    {
      id: "dates",
      header: "SCHEDULE",
      cell: ({ row }) => {
        const c = row.original
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {c.startDate} → {c.endDate}
          </span>
        )
      },
    },
    {
      id: "products",
      header: "PRODUCTS",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.productIds.length}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as Campaign["status"]
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
        const campaign = row.original
        const handleDelete = () => {
          deleteCampaign(campaign.id)
          toast.success(`Campaign "${campaign.name}" deleted`)
        }
        return (
          <TableActions
            itemName={campaign.name}
            onDelete={handleDelete}
            viewUrl={`/campaign_detail/${campaign.id}`}
            editUrl={`/campaign_form/${campaign.id}`}
          />
        )
      },
    },
  ]

  const csvData = campaigns.map((c) => ({
    name: c.name,
    type: c.type,
    start: c.startDate,
    end: c.endDate,
    products: c.productIds.length,
    status: c.status,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Campaigns</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Schedule flash sales and mega campaign events across your catalog.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="default" size="action" onClick={() => navigate("/campaign_form/new")}>
            <PlusIcon className="size-5" /> Add Campaign
          </Button>
          <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Campaigns")}>
            <DownloadIcon className="size-5" /> Export CSV
          </Button>
        </div>
      </div>

      <FilterToolbar
        searchPlaceholder="search campaign..."
        filters={[
          {
            component: <ExampleComboboxCustomItems placeholder="status" frameworks={statusOptions} />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={campaigns}
        columnWidths={["220px", "140px", "220px", "110px", "120px", "110px"]}
      />
    </div>
  )
}

export default Campaigns
