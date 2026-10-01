import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ArrowLeft, Calendar, Edit } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle } from "@/features/marketing/slices/campaignSlice"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatDateTime } from "@/lib/format"
import { DetailPageState } from "@/components/common/DetailPageState"
import { resolveDetailState } from "@/lib/detailState"

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: campaign, singleStatus, singleError } = useAppSelector((state) => state.campaigns)

  useDocumentTitle(campaign?.name ? `${campaign.name} — Campaign` : "Campaign Details")

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
  }, [dispatch, id])

  const pageState = resolveDetailState(singleStatus, singleError, campaign?.id === id)
  if (pageState || !campaign || campaign.id !== id) {
    return (
      <DetailPageState
        state={pageState ?? "loading"}
        entity="Campaign"
        backTo="/campaigns"
        backLabel="Back to Campaigns"
        error={singleError}
        onRetry={() => id && dispatch(fetchSingle(id))}
      />
    )
  }

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="back" size="icon" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-muted-foreground text-sm capitalize">{campaign.campaign_type} campaign</p>
          </div>
        </div>
        <Button variant="apply" size="action" onClick={() => navigate(`/campaign_form/${campaign.id}`)}>
          <Edit className="size-5" />
          Edit Campaign
        </Button>
      </div>

      {campaign.banner_image && (
        <div className="rounded-xl overflow-hidden border border-border max-h-64">
          <img
            src={campaign.banner_image}
            alt={campaign.name}
            loading="lazy"
            className="w-full h-40 sm:h-64 object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starts</span>
              <span className="font-medium">{formatDateTime(campaign.starts_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ends</span>
              <span className="font-medium">{formatDateTime(campaign.ends_at)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={campaign.status} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Hero Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {campaign.hero_title || "No hero title set."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CampaignDetail
