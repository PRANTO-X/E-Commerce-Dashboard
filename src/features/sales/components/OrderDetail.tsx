import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, cancelOrder, collectCod, updateOrderStatus } from "@/features/sales/slices/orderSlice"
import {
  fetchCouriers,
  fetchShipments,
  bookCourierShipment,
  addTracking,
  updateTracking,
} from "@/features/shipping/slices/shippingSlice"
import type { TrackingStatus } from "@/features/shipping/types"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { OrderStatus, PaymentStatus, UpdatableOrderStatus } from "@/features/sales/types"
import {
  ChevronLeft,
  Mail,
  Calendar,
  CreditCard,
  Package,
  AlertCircle,
  Ban,
  DollarSign,
  Truck,
  ArrowLeft,
} from "lucide-react"

const paymentStatusStyles: Record<PaymentStatus, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  partially_refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const fulfillmentStatusStyles: Record<OrderStatus, string> = {
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
  const dispatch = useAppDispatch()
  const { singleData: order, isLoading } = useAppSelector((state) => state.orders)
  const { couriers, shipments } = useAppSelector((state) => state.shipping)
  const navigate = useNavigate()
  const [nextStatus, setNextStatus] = useState<UpdatableOrderStatus | "">("")
  const [submitting, setSubmitting] = useState(false)

  const [selectedCourier, setSelectedCourier] = useState("")
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | "">("")

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
    dispatch(fetchCouriers())
    dispatch(fetchShipments())
  }, [dispatch, id])

  const refresh = () => id && dispatch(fetchSingle(id))
  const shipment = shipments.find((s) => s.order === id)

  const handleBookCourier = async () => {
    if (!order || !selectedCourier) return
    setSubmitting(true)
    try {
      await dispatch(bookCourierShipment({ orderId: order.id, payload: { integration_id: selectedCourier } })).unwrap()
      toast.success("Courier booked")
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
      toast.success("Tracking added")
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

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading order...</div>
  }

  if (!order || order.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link to="/orders">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const customerName = [order.customer.first_name, order.customer.last_name].filter(Boolean).join(" ")

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground text-sm">Detailed information about {order.order_number}</p>
        </div>
      </div>

      {/* Row 1: Order Summary & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{order.order_number}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {order.placed_at ? new Date(order.placed_at).toLocaleString() : "—"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className={paymentStatusStyles[order.payment_status]}>
                  {order.payment_status}
                </Badge>
                <Badge variant="outline" className={fulfillmentStatusStyles[order.status]}>
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as UpdatableOrderStatus)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Change status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleUpdateStatus} disabled={!nextStatus || submitting}>
                Apply
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={order.status === "cancelled" || submitting}
                onClick={handleCancelOrder}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
              {order.payment_method === "cash_on_delivery" && order.cod_status === "pending_collection" && (
                <Button variant="outline" size="sm" disabled={submitting} onClick={handleCollectCod}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Collect COD
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Customer Info */}
      <Card className="shadow-sm border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {(customerName || order.customer.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-base">{customerName || order.customer.email}</p>
              <p className="text-xs text-muted-foreground">Customer ID: {order.customer.id}</p>
            </div>
          </div>
          <div className="grid gap-2 pt-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer.email}</span>
            </div>
          </div>
          {order.customer_notes && (
            <div className="pt-2 text-sm">
              <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Customer Notes</p>
              <p className="text-muted-foreground">{order.customer_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="shadow-sm border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shipment ? (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{shipment.provider || "Courier"}</p>
                <p className="text-muted-foreground text-xs">
                  Tracking #: {shipment.tracking_number || "—"}
                </p>
              </div>
              <Badge variant="outline">{shipment.status}</Badge>
            </div>
          ) : (
            <div className="flex gap-2">
              <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select courier..." />
                </SelectTrigger>
                <SelectContent>
                  {couriers.map((c) => (
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
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="carrier">Carrier</FieldLabel>
              <FieldContent>
                <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. Pathao" />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="tracking_number">Tracking Number</FieldLabel>
              <FieldContent>
                <Input id="tracking_number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
              </FieldContent>
            </Field>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddTracking} disabled={submitting || !carrier.trim() || !trackingNumber.trim()}>
            Add Tracking
          </Button>

          <div className="flex gap-2 items-end pt-2">
            <Select value={trackingStatus} onValueChange={(v) => setTrackingStatus(v as TrackingStatus)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Update tracking status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleUpdateTracking} disabled={!trackingStatus || submitting}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Ordered Products Table */}
      <Card className="shadow-sm border-none overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Ordered Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product_name}
                    {item.variant_name && (
                      <span className="text-muted-foreground"> · {item.variant_name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs uppercase">{item.sku}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${Number(item.line_total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {order.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No items on this order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Row 4: Pricing Summary & Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-${Number(order.discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>${Number(order.shipping_cost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax_amount).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Total Amount</span>
              <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-3 mt-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-semibold text-primary uppercase tracking-wider">Payment Method</p>
                <p className="text-muted-foreground italic">
                  {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Stripe"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {order.status_history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
            ) : (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-muted">
                {order.status_history.map((entry) => (
                  <div key={entry.id} className="relative flex items-center gap-4 pl-8">
                    <div className="absolute left-0 h-6 w-6 rounded-full border-4 border-background ring-2 bg-primary ring-primary/20" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {entry.from_status || "—"} → {entry.to_status}
                      </span>
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
