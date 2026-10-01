import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchSingle,
  cancelOrder,
  collectCod,
  updateOrderStatus,
  selectOrderDetail,
} from "@/features/sales/slices/orderSlice"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { UpdatableOrderStatus } from "@/features/sales/types"
import {
  Mail,
  CreditCard,
  Package,
  Ban,
  DollarSign,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency, formatDateTime, humanize } from "@/lib/format"
import { DetailPageState } from "@/components/common/DetailPageState"
import { resolveDetailState } from "@/lib/detailState"
import { OrderShippingPanel } from "./OrderShippingPanel"

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

  const singleData = useAppSelector(selectOrderDetail)
  const { singleStatus, singleError } = useAppSelector((state) => state.orders)

  // Only the detail endpoint's response is used. List rows lack items/tax/shipping, so
  // falling back to them would render a misleading summary (e.g. $0 tax).
  const order = singleData && singleData.id === id ? singleData : null

  useDocumentTitle(order?.order_number ? `${order.order_number} — Order` : "Order Details")

  const [nextStatus, setNextStatus] = useState<UpdatableOrderStatus | "">("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    if (!id) return undefined
    return dispatch(fetchSingle(id))
  }, [dispatch, id])

  useEffect(() => {
    const request = load()
    return () => request?.abort()
  }, [load])

  const refresh = () => {
    load()
  }

  const handleCancelOrder = async () => {
    if (!order) return
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
      toast.success(`Order status updated to ${humanize(nextStatus)}`)
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

  const pageState = resolveDetailState(singleStatus, singleError, !!order)
  if (pageState || !order) {
    return (
      <DetailPageState
        state={pageState ?? "loading"}
        entity="Order"
        backTo="/orders"
        backLabel="Back to Orders"
        error={singleError}
        onRetry={refresh}
      />
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
              <StatusBadge status={order.payment_status} label={`Payment: ${humanize(order.payment_status)}`} />
              <StatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Placed on {formatDateTime(orderDate)}
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
                <span className="font-semibold capitalize">{order.cod_status ? humanize(order.cod_status) : "Pending"}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Items Count</span>
              <span className="font-semibold">{orderItems.length} item(s)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-primary text-base">
                {formatCurrency(order.total_amount)}
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={order.status === "cancelled" || submitting}
                  >
                    <Ban className="h-4 w-4 mr-1.5" />
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel order {order.order_number}?</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleCancelOrder}>
                      Cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

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

        <OrderShippingPanel orderId={order.id} />
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
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {formatCurrency(item.line_total)}
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
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Cost</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
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
                        {entry.from_status ? `${humanize(entry.from_status)} → ` : ""}
                        {humanize(entry.to_status)}
                      </span>
                      {entry.reason && (
                        <span className="text-xs text-muted-foreground">{entry.reason}</span>
                      )}
                      {entry.created_at && (
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDateTime(entry.created_at)}
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
