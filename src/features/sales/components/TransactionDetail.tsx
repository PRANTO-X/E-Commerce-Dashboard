import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Download,
  Printer,
  User,
  CreditCard,
  MapPin,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  Clock,
  History,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TransactionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data for the transaction
  const transaction = {
    id: id || "TXN1001",
    orderId: "ORD5001",
    date: "May 01, 2025 10:24 AM",
    status: "paid",
    amount: 249.99,
    paymentMethod: {
      type: "Credit Card",
      provider: "Visa",
      last4: "4242",
      expiry: "12/26",
    },
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      id: "CUST-1001",
      avatar: "JS",
    },
    billingAddress: "123 Maple Avenue, Springfield, IL 62704, USA",
    shippingAddress: "123 Maple Avenue, Springfield, IL 62704, USA",
    financials: {
      subtotal: 220.0,
      tax: 15.4,
      shipping: 14.59,
      discount: 0.0,
      total: 249.99,
    },
    security: {
      ipAddress: "192.168.1.1",
      riskLevel: "Low",
      device: "Chrome on macOS",
      location: "Springfield, IL",
    },
    timeline: [
      { status: "Transaction Authorized", date: "May 01, 2025 10:23 AM", description: "Payment was authorized by the bank." },
      { status: "Funds Captured", date: "May 01, 2025 10:24 AM", description: "Funds were successfully captured." },
      { status: "Notification Sent", date: "May 01, 2025 10:25 AM", description: "Email confirmation sent to customer." },
    ],
    activityLog: [
      { action: "Refund Issued", user: "System", date: "May 02, 2025 02:00 PM", details: "N/A" },
      { action: "Status Updated", user: "Admin (Sarah J.)", date: "May 01, 2025 10:24 AM", details: "Status changed to 'Paid'" },
    ],
    notes: "Customer requested eco-friendly packaging if possible.",
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
      case "refunded":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20"
    }
  }

  return (
    <div className="section-container space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold">
                Transaction {transaction.id}
              </h1>
              <Badge
                variant="outline"
                className={`capitalize ${getStatusColor(transaction.status)}`}
              >
                {transaction.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Placed on {transaction.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" size="action" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="primary" size="action" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Transaction Summary | Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Transaction Summary</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Amount</p>
                    <p className="text-xl font-bold">${transaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Order ID</p>
                    <Link to={`/order_detail/${transaction.orderId}`} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                      {transaction.orderId}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                    <p className="text-sm font-medium capitalize">{transaction.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                    <p className="text-sm font-medium">{transaction.date.split(",")[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" className="flex-1 min-w-[120px]">Refund</Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-[120px]">Receipt</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2: Customer Info | Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-5 text-primary" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {transaction.customer.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{transaction.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{transaction.customer.id}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{transaction.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{transaction.customer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{transaction.paymentMethod.provider} •••• {transaction.paymentMethod.last4}</p>
                    <p className="text-xs text-muted-foreground">Expires {transaction.paymentMethod.expiry}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {transaction.paymentMethod.type}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-medium truncate">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auth Code</p>
                  <p className="font-medium">#AUTH-9921</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Billing Info | Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Billing Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {transaction.billingAddress}
              </p>
              <Button variant="link" className="p-0 h-auto text-xs mt-2">
                Edit Address
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Items Ordered</span>
                <span className="font-medium">2 Items</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Fulfillment</span>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>
              </div>
              <Separator />
              <Button variant="default" size="sm" className="w-full" asChild>
                <Link to={`/order_detail/${transaction.orderId}`}>View Full Order</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Financial Info | Security Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="size-5 text-primary" />
                Financial Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${transaction.financials.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${transaction.financials.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${transaction.financials.shipping.toFixed(2)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-primary font-bold">${transaction.financials.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Security Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                  {transaction.security.riskLevel}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono text-xs">{transaction.security.ipAddress}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Device</span>
                <span className="truncate ml-4">{transaction.security.device}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 5: Transaction Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Transaction Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-muted">
              {transaction.timeline.map((event, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div className="absolute left-0 mt-1 h-10 w-10 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="ml-12">
                    <p className="text-sm font-bold">{event.status}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 6: Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.activityLog.map((log, index) => (
                <div key={index} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">By {log.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{log.date}</p>
                    <p className="text-xs text-muted-foreground italic">Details: {log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 7: Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-muted/50 border italic text-sm text-muted-foreground">
              "{transaction.notes}"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TransactionDetail