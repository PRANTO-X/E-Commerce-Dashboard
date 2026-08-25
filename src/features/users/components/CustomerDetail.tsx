import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllOrders } from "@/features/sales/slices/orderSlice"
import {
  fetchSingle,
  activateUser,
  deactivateUser,
  resetUserPassword,
  softDeleteUser,
} from "@/features/users/slices/customerSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  User,
  Lock,
  Ban,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: customer, isLoading } = useAppSelector((state) => state.customers)
  const { data: orders } = useAppSelector((state) => state.orders)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) dispatch(fetchSingle(id))
    dispatch(fetchAllOrders({ page: 1, page_size: 100 }))
  }, [dispatch, id])

  const refresh = () => id && dispatch(fetchSingle(id))

  const handleToggleActive = async () => {
    if (!customer) return
    setSubmitting(true)
    try {
      if (customer.is_active) {
        await dispatch(deactivateUser(customer.id)).unwrap()
        toast.success("Customer deactivated")
      } else {
        await dispatch(activateUser(customer.id)).unwrap()
        toast.success("Customer activated")
      }
    } catch {
      toast.error("Failed to update customer status")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!customer) return
    const newPassword = window.prompt("Enter a new password for this customer (min 8 characters):")
    if (!newPassword || newPassword.length < 8) {
      if (newPassword) toast.error("Password must be at least 8 characters")
      return
    }
    setSubmitting(true)
    try {
      await dispatch(resetUserPassword({ id: customer.id, new_password: newPassword })).unwrap()
      toast.success("Password reset")
    } catch {
      toast.error("Failed to reset password")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSoftDelete = async () => {
    if (!customer) return
    if (!window.confirm("Soft-delete this customer account? This cannot be undone from here.")) return
    setSubmitting(true)
    try {
      await dispatch(softDeleteUser(customer.id)).unwrap()
      toast.success("Customer account deleted")
      refresh()
    } catch {
      toast.error("Failed to delete customer")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading customer...</div>
  }

  if (!customer || customer.id !== id) {
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

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
  const customerOrders = orders.filter((o) => o.customer.id === customer.id)
  const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)

  return (
    <div className="section-container animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="back" size="icon" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Profile</h1>
            <p className="text-muted-foreground text-sm">Detailed information about {name || customer.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="action" onClick={handleResetPassword} disabled={submitting}>
            <Lock className="size-4" />
            Reset Password
          </Button>
          <Button variant="outline" size="action" onClick={handleToggleActive} disabled={submitting}>
            {customer.is_active ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
            {customer.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="outline" size="action" className="text-destructive hover:text-destructive" onClick={handleSoftDelete} disabled={submitting}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{customerOrders.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <h3 className="text-2xl font-bold mt-1">${totalSpent.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              {(name || customer.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{name || "—"}</p>
              <StatusBadge status={customer.is_active ? "active" : "inactive"} />
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
              <span className="text-muted-foreground">Email Verified</span>
              <span className="font-medium">{customer.is_email_verified ? "Yes" : "No"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.items[0]?.product_name ?? "—"}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
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
    </div>
  )
}

export default CustomerDetail
