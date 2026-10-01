import { useCallback, useEffect, useState } from "react"
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
import { useDocumentTitle } from "@/hooks/use-document-title"
import type { OrderListItem } from "@/features/sales/types"
import { formatCurrency, formatDate } from "@/lib/format"
import { DetailPageState } from "@/components/common/DetailPageState"
import { resolveDetailState } from "@/lib/detailState"

// Orders shown / summed for the customer. Total orders comes from the server's count; total
// spent is summed from the loaded rows (there's no per-customer revenue aggregate endpoint),
// so it's labelled as partial when the customer has more orders than this.
const CUSTOMER_ORDERS_PAGE_SIZE = 100

interface CustomerOrdersState {
  forId: string | null
  rows: OrderListItem[]
  total: number
  status: "loading" | "succeeded" | "failed"
}

const CustomerDetail = () => {
  useDocumentTitle("Customer Details")

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData, singleStatus, singleError } = useAppSelector((state) => state.customers)
  const customer = singleData && singleData.id === id ? singleData : null
  const [submitting, setSubmitting] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrdersState>({
    forId: null,
    rows: [],
    total: 0,
    status: "loading",
  })

  const loadCustomer = useCallback(() => {
    if (!id) return undefined
    return dispatch(fetchSingle(id))
  }, [dispatch, id])

  // Server-side filter by customer, read from the thunk result into local state so this page
  // never reads state.orders.data, whose page size/filters belong to whichever screen fetched last.
  const loadOrders = useCallback(() => {
    if (!id) return undefined
    const request = dispatch(fetchAllOrders({ customer: id, page: 1, page_size: CUSTOMER_ORDERS_PAGE_SIZE }))
    request
      .unwrap()
      .then((result) => {
        const rows = result.data as OrderListItem[]
        // Defensive: if a backend ignores the `customer` filter, don't attribute other
        // customers' orders (and their server-wide count) to this one.
        const mine = rows.filter((o) => o.customer?.id === id)
        const total = mine.length === rows.length ? result.total : mine.length
        setCustomerOrders({ forId: id, rows: mine, total, status: "succeeded" })
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return
        setCustomerOrders({ forId: id, rows: [], total: 0, status: "failed" })
      })
    return request
  }, [dispatch, id])

  useEffect(() => {
    const request = loadCustomer()
    return () => request?.abort()
  }, [loadCustomer])

  useEffect(() => {
    const request = loadOrders()
    return () => request?.abort()
  }, [loadOrders])

  const refresh = () => loadCustomer()

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
      await refresh()
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

  const pageState = resolveDetailState(singleStatus, singleError, !!customer)
  if (pageState || !customer) {
    return (
      <DetailPageState
        state={pageState ?? "loading"}
        entity="Customer"
        backTo="/customers"
        backLabel="Back to Customers"
        error={singleError}
        onRetry={() => {
          loadCustomer()
        }}
      />
    )
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
  const ordersReady = customerOrders.forId === id && customerOrders.status === "succeeded"
  const ordersFailed = customerOrders.forId === id && customerOrders.status === "failed"
  const orderRows = ordersReady ? customerOrders.rows : []
  const totalSpent = orderRows.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const spentIsPartial = ordersReady && customerOrders.total > orderRows.length

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
                <h2 className="text-2xl font-bold mt-1">{ordersReady ? customerOrders.total : "—"}</h2>
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
                <h2 className="text-2xl font-bold mt-1">{ordersReady ? formatCurrency(totalSpent) : "—"}</h2>
                {spentIsPartial && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Across the latest {orderRows.length} of {customerOrders.total} orders
                  </p>
                )}
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
          <CardTitle level={2} className="text-lg flex items-center gap-2">
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
          <CardTitle level={2} className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!ordersReady ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {ordersFailed ? (
                      <span className="inline-flex items-center gap-3">
                        Couldn't load this customer's orders.
                        <Button variant="outline" size="sm" onClick={() => loadOrders()}>
                          Retry
                        </Button>
                      </span>
                    ) : (
                      "Loading orders..."
                    )}
                  </TableCell>
                </TableRow>
              ) : orderRows.length > 0 ? (
                orderRows.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.payment_status} />
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
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
