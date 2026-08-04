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
import type { Campaign, CampaignStatus } from "@/features/marketing/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/marketing/slices/campaignSlice"
import { toast } from "sonner"

const statusStyles: Record<CampaignStatus, string> = {
  draft: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  ended: "bg-red-500/10 text-red-400 border border-red-500/20",
}

const Campaigns = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: allCampaigns } = useAppSelector((state) => state.campaigns)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  useEffect(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Active", value: "active" },
    { label: "Ended", value: "ended" },
  ]

  const campaigns = allCampaigns.filter((campaign) => {
    if (search && !campaign.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && campaign.status !== statusFilter.value) return false
    return true
  })

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "name",
      header: "CAMPAIGN",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "campaign_type",
      header: "TYPE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">{row.getValue("campaign_type")}</span>
      ),
    },
    {
      id: "dates",
      header: "SCHEDULE",
      cell: ({ row }) => {
        const c = row.original
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {new Date(c.starts_at).toLocaleDateString()} → {new Date(c.ends_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as CampaignStatus
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
        const handleDelete = async () => {
          try {
            await dispatch(deleteData(campaign.id)).unwrap()
            toast.success(`Campaign "${campaign.name}" deleted`)
          } catch {
            toast.error("Failed to delete campaign")
          }
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
    type: c.campaign_type,
    start: c.starts_at,
    end: c.ends_at,
    status: c.status,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Schedule mega, landing, and seasonal marketing campaigns.
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
        data={campaigns}
        columnWidths={["220px", "140px", "220px", "120px", "110px"]}
      />
    </div>
  )
}

export default Campaigns
