import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import type { Campaign, CampaignStatus } from "@/features/marketing/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/marketing/slices/campaignSlice"
import { toast } from "sonner"

const Campaigns = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: allCampaigns, isLoading, error } = useAppSelector((state) => state.campaigns)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  const loadCampaigns = useCallback(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as CampaignStatus} />
      ),
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
        <PageHeading
          title="Campaigns"
          description="Schedule mega, landing, and seasonal marketing campaigns."
        />

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
        isLoading={isLoading}
        error={error}
        onRetry={loadCampaigns}
        onRowClick={(campaign) => navigate(`/campaign_detail/${campaign.id}`)}
        minWidth="850px"
        columnWidths={["220px", "140px", "220px", "120px", "110px"]}
      />
    </div>
  )
}

export default Campaigns
