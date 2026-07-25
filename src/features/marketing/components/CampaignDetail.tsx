import { useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Calendar, Edit, Package } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle } from "@/features/marketing/slices/campaignSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"

const statusStyles = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  ended: "bg-red-500/10 text-red-400 border-red-500/20",
} as const

const typeLabels = {
  flash_sale: "Flash Sale",
  mega_event: "Mega Event",
  seasonal: "Seasonal",
} as const

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: campaign, isLoading } = useAppSelector((state) => state.campaigns)
  const { data: products } = useAppSelector((state) => state.products)

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
    dispatch(fetchAllProducts())
  }, [dispatch, id])

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading campaign...</div>
  }

  if (!campaign || campaign.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Campaign not found</h2>
        <Button asChild className="mt-6">
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>
    )
  }

  const linkedProducts = products.filter((p) => campaign.productIds.includes(p.id))

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="back" size="icon" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-muted-foreground text-sm">{typeLabels[campaign.type]} campaign</p>
          </div>
        </div>
        <Button variant="apply" size="action" onClick={() => navigate(`/campaign_form/${campaign.id}`)}>
          <Edit className="size-5" />
          Edit Campaign
        </Button>
      </div>

      {campaign.bannerImage && (
        <div className="rounded-xl overflow-hidden border border-border max-h-64">
          <img src={campaign.bannerImage} alt={campaign.name} className="w-full h-64 object-cover" />
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
              <span className="font-medium">{campaign.startDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ends</span>
              <span className="font-medium">{campaign.endDate}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className={statusStyles[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {campaign.description || "No description provided."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Linked Products ({linkedProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {linkedProducts.length > 0 ? (
            <div className="divide-y divide-border">
              {linkedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product_detail/${p.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors"
                >
                  <img src={p.image} alt={p.product} className="h-10 w-10 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.product}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <span className="text-sm font-semibold">${p.price.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">No products linked to this campaign.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignDetail
