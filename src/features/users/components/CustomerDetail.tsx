import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppData } from "@/store/AppDataProvider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingBag,
  Clock,
  Edit,
  User,
  Lock,
  MessageSquare,
  DollarSign,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  DownloadIcon,
  Save
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCustomerById, updateCustomer, orders } = useAppData()
  const [note, setNote] = useState("")

  const customer = getCustomerById(id ?? "")

  const handleResetPassword = () => {
    if (!customer) return
    toast.success(`Password reset email sent to ${customer.email}`)
  }

  const handleSendEmail = () => {
    if (!customer) return
    toast.success(`Email sent to ${customer.email}`)
  }

  const handleSaveNote = () => {
    if (!customer || !note.trim()) return
    updateCustomer(customer.id, { notes: [note.trim(), ...(customer.notes ?? [])] })
    setNote("")
    toast.success("Note added")
  }

  if (!customer) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <p className="text-muted-foreground mt-2">The customer you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/customers")} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    )
  }

  const customerOrders = orders.filter(o => o.customerId === customer.id)
  
  // Mock transactions for display
  const transactions = [
    { id: "TX-9821", date: "Oct 24, 2023", amount: 299.00, status: "Completed", method: "Visa •••• 4242" },
    { id: "TX-9820", date: "Sep 15, 2023", amount: 125.50, status: "Completed", method: "PayPal" },
    { id: "TX-9819", date: "Aug 02, 2023", amount: 450.00, status: "Refunded", method: "Visa •••• 4242" },
  ]

  const activityTimeline = [
    { title: "Order #ORD-0012 Placed", description: "Customer placed a new order for Cloud Core Subscription", date: "Oct 24, 2023 - 10:30 AM", icon: ShoppingBag, color: "text-blue-500" },
    { title: "Support Ticket Resolved", description: "Inquiry about shipping delay was resolved by Staff", date: "Oct 15, 2023 - 02:45 PM", icon: MessageSquare, color: "text-green-500" },
    { title: "Account Details Updated", description: "Customer changed their primary shipping address", date: "Sep 20, 2023 - 11:15 AM", icon: User, color: "text-purple-500" },
    { title: "Logged In", description: "Customer logged in from a new device in New York, US", date: "Sep 19, 2023 - 09:00 AM", icon: Lock, color: "text-amber-500" },
  ]

  return (
    <div className="section-container animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="icon"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Customer Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Detailed information about {customer.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="action" onClick={handleResetPassword}>
            <Lock className="size-4" />
            Reset Password
          </Button>
          <Button variant="default" size="action" onClick={handleSendEmail}>
            <Mail className="size-4" />
            Send Email
          </Button>
          <Button variant="primary" size="action">
            <DownloadIcon className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{customer.totalOrders}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <h3 className="text-2xl font-bold mt-1">${customer.totalSpent.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <h3 className="text-2xl font-bold mt-1">{transactions.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <History className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span>Lifetime activity</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(2) : "0.00"}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-red-500">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              <span>3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg">{customer.name}</p>
                <Badge variant="outline" className={customer.status === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                  {customer.status}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <span className="font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </span>
                <span className="font-medium">{customer.phone || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined
                </span>
                <span className="font-medium">{customer.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Last Active
                </span>
                <span className="font-medium">{customer.lastOrderAt || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shipping Address</p>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {customer.address || "123 Tech Lane, Silicon Valley"}<br />
                  {customer.city || "San Jose"}, {customer.zipCode || "94025"}<br />
                  {customer.country || "United States"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Billing Address</p>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-sm font-medium">Same as shipping address</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.length > 0 ? (
                customerOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={order.fulfillmentStatus === "Shipped" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}>
                        {order.fulfillmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/order_detail/${order.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No orders found for this customer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {tx.method}
                  </TableCell>
                  <TableCell className={tx.status === "Refunded" ? "text-red-500" : ""}>
                    {tx.status === "Refunded" ? "-" : ""}${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.status === "Completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span>{tx.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-0.5 before:bg-muted">
            {activityTimeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-6 pl-12">
                <div className={`absolute left-0 h-10 w-10 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-sm z-10 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Admin Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a private note about this customer..."
            className="min-h-[120px] bg-muted/20 border-border/50 resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end">
            <Button variant="default" size="lg" onClick={handleSaveNote} disabled={!note.trim()}>
              <Save/>
              Save Note
            </Button>
          </div>
          {customer.notes && customer.notes.length > 0 && (
            <div className="space-y-2 pt-2">
              {customer.notes.map((n, idx) => (
                <div key={idx} className="text-sm bg-muted/30 p-3 rounded-lg">
                  {n}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerDetail
