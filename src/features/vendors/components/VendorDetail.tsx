import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, patchData } from "@/features/vendors/slices/vendorSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import { useEffect } from "react"
import { toast } from "sonner"

const statusStyles = {
  approved: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  rejected: "bg-gray-500/10 text-gray-500 border-gray-500/20",
} as const

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: vendor, isLoading } = useAppSelector((state) => state.vendors)
  const { data: products } = useAppSelector((state) => state.products)

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
    dispatch(fetchAllProducts())
  }, [dispatch, id])

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading vendor...</div>
  }

  if (!vendor || vendor.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Vendor not found</h2>
        <Button asChild className="mt-6">
          <Link to="/vendors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Link>
        </Button>
      </div>
    )
  }

  const handleApprove = () => {
    dispatch(patchData({ id: vendor.id, payload: { status: "approved" } }))
    toast.success(`${vendor.name} approved`)
  }

  const handleReject = () => {
    if (!window.confirm(`Reject ${vendor.name}'s vendor application?`)) return
    dispatch(patchData({ id: vendor.id, payload: { status: "rejected" } }))
    toast.success(`${vendor.name} rejected`)
  }

  const handleSuspend = () => {
    if (!window.confirm(`Suspend ${vendor.name}? They will no longer be able to sell.`)) return
    dispatch(patchData({ id: vendor.id, payload: { status: "suspended" } }))
    toast.success(`${vendor.name} suspended`)
  }

  const handlePayout = () => {
    if (vendor.payoutBalance <= 0) return
    if (!window.confirm(`Mark $${vendor.payoutBalance.toFixed(2)} as paid out to ${vendor.name}?`)) return
    dispatch(patchData({ id: vendor.id, payload: { payoutBalance: 0 } }))
    toast.success("Payout recorded")
  }

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="back" size="icon" onClick={() => navigate("/vendors")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-muted-foreground text-sm">Vendor ID: {vendor.id}</p>
          </div>
        </div>
        <Badge variant="outline" className={statusStyles[vendor.status]}>
          {vendor.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <h3 className="text-2xl font-bold mt-1">${vendor.totalSales.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Products</p>
            <h3 className="text-2xl font-bold mt-1">{vendor.totalProducts}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
            <h3 className="text-2xl font-bold mt-1">{vendor.commissionRate}%</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Payout Balance</p>
            <h3 className="text-2xl font-bold mt-1 text-primary">${vendor.payoutBalance.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Contact & KYC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" /> {vendor.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" /> {vendor.phone || "N/A"}
            </div>
            {vendor.kycDocUrl && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a href={vendor.kycDocUrl} className="text-primary underline">View KYC Document</a>
              </div>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">Joined {vendor.joinedAt}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Vendor Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="primary" size="sm" disabled={vendor.status === "approved"} onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
            </Button>
            <Button variant="primary" size="sm" disabled={vendor.status === "rejected"} onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={vendor.status === "suspended"}
              onClick={handleSuspend}
            >
              <Ban className="h-4 w-4 mr-2" /> Suspend
            </Button>
            <Button variant="primary" size="sm" disabled={vendor.payoutBalance <= 0} onClick={handlePayout}>
              <Wallet className="h-4 w-4 mr-2" /> Pay Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Vendor Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="p-6 text-center text-sm text-muted-foreground">
            {products.length} products exist in the shared catalog — per-vendor product ownership isn't modeled yet.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default VendorDetail
