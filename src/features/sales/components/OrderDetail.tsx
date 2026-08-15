import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, fetchAll as fetchAllOrders, cancelOrder, collectCod, updateOrderStatus } from "@/features/sales/slices/orderSlice"
import {
  fetchCouriers,
  fetchShipments,
  bookCourierShipment,
  addTracking,
  updateTracking,
} from "@/features/shipping/slices/shippingSlice"
import type { TrackingStatus } from "@/features/shipping/types"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UpdatableOrderStatus, OrderDetail as OrderDetailType } from "@/features/sales/types"
import {
  Mail,
  CreditCard,
  Package,
  AlertCircle,
  Ban,
  DollarSign,
  Truck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react"

const paymentStatusStyles: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  partially_refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const fulfillmentStatusStyles: Record<string, string> = {
  pending_payment: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  placed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shipped: "bg-green-500/10 text-green-500 border-green-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusOptions: { label: string; value: UpdatableOrderStatus }[] = [
  { label: "Placed", value: "placed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
]

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { singleData: rawSingleData, data: allOrders, isLoading } = useAppSelector((state) => state.orders)
  const { couriers, shipments } = useAppSelector((state) => state.shipping)

  // Resolve order from singleData or fallback to list
  const order: OrderDetailType | undefined =
    rawSingleData && "id" in rawSingleData && rawSingleData.id === id
      ? (rawSingleData as OrderDetailType)
      : allOrders.find((o) => o.id === id)

  const [nextStatus, setNextStatus] = useState<UpdatableOrderStatus | "">("")
  const [submitting, setSubmitting] = useState(false)

  const [selectedCourier, setSelectedCourier] = useState("")
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | "">("")

  useEffect(() => {
    if (id) {
      dispatch(fetchSingle(id))
    }
    dispatch(fetchAllOrders({ page: 1, page_size: 100 }))
    dispatch(fetchCouriers())
    dispatch(fetchShipments())
  }, [dispatch, id])

  const refresh = () => id && dispatch(fetchSingle(id))

  const safeShipments = Array.isArray(shipments) ? shipments : []
  const safeCouriers = Array.isArray(couriers) ? couriers : []
  const shipment = safeShipments.find((s) => s.order === id)

  const handleBookCourier = async () => {
    if (!order || !selectedCourier) return
    setSubmitting(true)
    try {
      await dispatch(bookCourierShipment({ orderId: order.id, payload: { integration_id: selectedCourier } })).unwrap()
      toast.success("Courier booked successfully")
    } catch {
      toast.error("Failed to book courier")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddTracking = async () => {
    if (!order || !carrier.trim() || !trackingNumber.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        addTracking({ orderId: order.id, payload: { carrier: carrier.trim(), tracking_number: trackingNumber.trim() } })
      ).unwrap()
      toast.success("Tracking information added")
      setCarrier("")
      setTrackingNumber("")
    } catch {
      toast.error("Failed to add tracking")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTracking = async () => {
    if (!order || !trackingStatus) return
    setSubmitting(true)
    try {
      await dispatch(updateTracking({ orderId: order.id, payload: { status: trackingStatus } })).unwrap()
      toast.success("Tracking status updated")
      setTrackingStatus("")
    } catch {
      toast.error("Failed to update tracking")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    if (!window.confirm(`Cancel order ${order.order_number}? This cannot be undone.`)) return
    setSubmitting(true)
    try {
      await dispatch(cancelOrder({ id: order.id })).unwrap()
      toast.success(`Order ${order.order_number} cancelled`)
      refresh()
    } catch {
      toast.error("Failed to cancel order")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !nextStatus) return
    setSubmitting(true)
    try {
      await dispatch(updateOrderStatus({ id: order.id, status: nextStatus })).unwrap()
      toast.success(`Order status updated to ${nextStatus}`)
      setNextStatus("")
      refresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCollectCod = async () => {
    if (!order) return
    setSubmitting(true)
    try {
      await dispatch(collectCod({ id: order.id, amount: order.total_amount })).unwrap()
      toast.success("COD payment collected")
      refresh()
    } catch {
      toast.error("Failed to record COD collection")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading && !order) {
    return (
      <div className="section-container py-16 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="section-container py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The order you're looking for doesn't exist or may have been deleted.
        </p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  const customerObj = order.customer && typeof order.customer === "object" ? order.customer : null
  const customerName = customerObj
    ? [customerObj.first_name, customerObj.last_name].filter(Boolean).join(" ")
    : ""
  const customerEmail = customerObj?.email || "No email provided"
  const customerId = customerObj?.id || "—"

  const orderItems = Array.isArray(order.items) ? order.items : []
  const statusHistory = Array.isArray(order.status_history) ? order.status_history : []
  const orderDate = order.placed_at || order.created_at

  return (
    <div className="section-container space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="back" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{order.order_number}</h1>
              <Badge
                variant="outline"
                className={paymentStatusStyles[order.payment_status] ?? "bg-muted text-muted-foreground"}
              >
                Payment: {order.payment_status.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className={fulfillmentStatusStyles[order.status] ?? "bg-muted text-muted-foreground"}
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Placed on {orderDate ? new Date(orderDate).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Status & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Order Info */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Order Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold capitalize">
                {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Online Payment"}
              </span>
            </div>
            {order.payment_method === "cash_on_delivery" && (
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">COD Status</span>
                <span className="font-semibold capitalize">{order.cod_status || "Pending"}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Items Count</span>
              <span className="font-semibold">{orderItems.length} item(s)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-primary text-base">
                ${Number(order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status Actions */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Manage Order Status & Actions
            </CardTitle>
            <CardDescription>Update delivery progress, collect payments, or cancel order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as UpdatableOrderStatus)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Update order status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="default" onClick={handleUpdateStatus} disabled={!nextStatus || submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                Apply Status
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-1 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={order.status === "cancelled" || submitting}
                onClick={handleCancelOrder}
              >
                <Ban className="h-4 w-4 mr-1.5" />
                Cancel Order
              </Button>

              {order.payment_method === "cash_on_delivery" && order.cod_status === "pending_collection" && (
                <Button variant="outline" size="sm" disabled={submitting} onClick={handleCollectCod}>
                  <DollarSign className="h-4 w-4 mr-1.5 text-green-500" />
                  Collect COD Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Customer & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(customerName || customerEmail).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-base">{customerName || "Customer"}</p>
                <p className="text-xs text-muted-foreground">ID: {customerId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>{customerEmail}</span>
            </div>
            {order.customer_notes && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">Customer Note</p>
                <p className="text-muted-foreground text-xs">{order.customer_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping & Tracking */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Shipping & Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipment ? (
              <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">{shipment.provider || "Courier"}</p>
                  <p className="text-xs text-muted-foreground">
                    Tracking #: <span className="font-mono">{shipment.tracking_number || "—"}</span>
                  </p>
                </div>
                <Badge variant="outline">{shipment.status}</Badge>
              </div>
            ) : safeCouriers.length > 0 ? (
              <div className="flex gap-2">
                <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select courier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {safeCouriers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleBookCourier} disabled={!selectedCourier || submitting}>
                  Book Courier
                </Button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="carrier">Carrier</FieldLabel>
                <FieldContent>
                  <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. DHL, FedEx" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="tracking_number">Tracking Number</FieldLabel>
                <FieldContent>
                  <Input id="tracking_number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. TRK12345" />
                </FieldContent>
              </Field>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTracking}
                disabled={submitting || !carrier.trim() || !trackingNumber.trim()}
              >
                Add Tracking
              </Button>

              <div className="flex-1 flex gap-2">
                <Select value={trackingStatus} onValueChange={(v) => setTrackingStatus(v as TrackingStatus)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Update status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={handleUpdateTracking} disabled={!trackingStatus || submitting}>
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Ordered Products Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Ordered Products ({orderItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product_name}
                    {item.variant_name && (
                      <span className="text-muted-foreground text-xs block">{item.variant_name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs uppercase">{item.sku}</TableCell>
                  <TableCell className="text-center font-semibold">{item.quantity}x</TableCell>
                  <TableCell className="text-right">${Number(item.unit_price || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ${Number(item.line_total || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {orderItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No items recorded on this order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Row 4: Pricing Summary & Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Summary */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-${Number(order.discount_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Cost</span>
              <span>${Number(order.shipping_cost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax_amount || 0).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-3 mt-4 border border-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-semibold text-primary uppercase tracking-wider">Payment Method</p>
                <p className="text-muted-foreground">
                  {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Online Payment (Stripe)"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No status transitions recorded yet.</p>
            ) : (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-muted">
                {statusHistory.map((entry) => (
                  <div key={entry.id} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-0 mt-0.5 h-6 w-6 rounded-full border-4 border-background ring-2 bg-primary ring-primary/20" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground capitalize">
                        {entry.from_status ? `${entry.from_status} → ` : ""}
                        {entry.to_status}
                      </span>
                      {entry.reason && (
                        <span className="text-xs text-muted-foreground">{entry.reason}</span>
                      )}
                      {entry.created_at && (
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrderDetail
