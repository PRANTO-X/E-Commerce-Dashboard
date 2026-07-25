import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, patchData } from "@/features/sales/slices/orderSlice"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Package,
  AlertCircle,
  FileText,
  Clock,
  Ban,
  RotateCcw,
  ArrowLeft
} from "lucide-react"

const paymentStatusStyles = {
  Paid: "bg-green-500/10 text-green-500 border-green-500/20",
  Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Failed: "bg-red-500/10 text-red-500 border-red-500/20",
  Refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const fulfillmentStatusStyles = {
  Shipped: "bg-green-500/10 text-green-500 border-green-500/20",
  Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Unfulfilled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { singleData: order, isLoading } = useAppSelector((state) => state.orders)
  const navigate = useNavigate();
  const [note, setNote] = useState("")

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
  }, [dispatch, id])

  const logActivity = (message: string) => {
    if (!order) return
    dispatch(patchData({
      id: order.id,
      payload: {
        activityLog: [
          { type: "staff", message, date: new Date().toLocaleString() },
          ...order.activityLog,
        ],
      },
    }))
  }

  const handleCancelOrder = () => {
    if (!order) return
    if (!window.confirm(`Cancel order ${order.id}? This cannot be undone.`)) return
    dispatch(patchData({ id: order.id, payload: { fulfillmentStatus: "Cancelled" } }))
    logActivity("Order cancelled by Admin.")
    toast.success(`Order ${order.id} cancelled`)
  }

  const handleRefundOrder = () => {
    if (!order) return
    if (!window.confirm(`Refund order ${order.id}?`)) return
    dispatch(patchData({ id: order.id, payload: { paymentStatus: "Refunded" } }))
    logActivity("Order marked as refunded by Admin.")
    toast.success(`Order ${order.id} refunded`)
  }

  const handleEmailCustomer = () => {
    if (!order) return
    toast.success(`Email sent to ${order.email || order.customer}`)
  }

  const handleSaveNote = () => {
    if (!note.trim()) return
    logActivity(note.trim())
    setNote("")
    toast.success("Note added")
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

  const subtotal = order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0
  const total = subtotal - order.discount + order.shippingFee + order.tax

  return (
    <div className="section-container py-6 space-y-6 print-area">
      <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ordetails Details
            </h1>
            <p className="text-muted-foreground text-sm">
              Detailed information about {order.id}
            </p>
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
                <h2 className="text-2xl font-bold tracking-tight">{order.id}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {order.date}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className={paymentStatusStyles[order.paymentStatus]}>
                  {order.paymentStatus}
                </Badge>
                <Badge variant="outline" className={fulfillmentStatusStyles[order.fulfillmentStatus]}>
                  {order.fulfillmentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Order
              </Button>
              <Button variant="primary" size="sm" onClick={handleEmailCustomer}>
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={order.fulfillmentStatus === "Cancelled"}
                onClick={handleCancelOrder}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={order.paymentStatus === "Refunded"}
                onClick={handleRefundOrder}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refund Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Customer Info & Shipping Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {order.customer.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-base">{order.customer}</p>
                <p className="text-xs text-muted-foreground">Customer ID: {order.customerId}</p>
              </div>
            </div>
            <div className="grid gap-2 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.email || "No email available"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.phone || "No phone available"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 text-sm leading-relaxed">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{order.shippingAddress || "No shipping address provided"}</span>
            </div>
            <div className="grid gap-2 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Standard Ground Shipping</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">#TRK-982347123</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Ordered Products Table */}
      <Card className="shadow-sm border-none overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Ordered Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded border overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs uppercase">{item.id}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Row 4: Pricing Summary & Order Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-${order.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span>${order.shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Total Amount</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-3 mt-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-semibold text-primary uppercase tracking-wider">Payment Method</p>
                <p className="text-muted-foreground italic">{order.paymentMethod}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-muted">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-4 pl-8">
                  <div className={`absolute left-0 h-6 w-6 rounded-full border-4 border-background ring-2 ${
                    step.status === 'completed' ? 'bg-primary ring-primary/20' : 
                    step.status === 'active' ? 'bg-primary animate-pulse ring-primary/40' : 
                    'bg-muted ring-muted/20'
                  }`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Activity Log / Notes */}
      <Card className="shadow-sm border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Activity Log & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {order.activityLog.map((log, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {log.type === 'system' ? <Clock className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 text-sm bg-muted/30 p-3 rounded-lg">
                  <p className={log.type === 'system' ? 'italic text-muted-foreground' : ''}>
                    {log.type === 'system' ? 'System: ' : 'Staff: '}
                    {log.message}
                  </p>
                  <p className="text-[10px] mt-1 text-muted-foreground uppercase tracking-wider">{log.date}</p>
                </div>
              </div>
            ))}
          </div>

              <div className="pt-4 border-t no-print">
                <label className="text-sm font-medium mb-2 block">Add Internal Note</label>
                <div className="flex flex-col gap-3">
                  <Textarea
                    placeholder="Type your note here..."
                    className="resize-none min-h-[100px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSaveNote} disabled={!note.trim()}>Save Note</Button>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetail
