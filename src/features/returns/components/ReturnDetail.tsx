import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, PackageCheck, Cog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchReturn,
  approveReturn,
  rejectReturn,
  markReturnReceived,
  processReturn,
} from "@/features/returns/slices/returnSlice"
import { fetchAll as fetchAllOrders } from "@/features/sales/slices/orderSlice"
import type { ReturnResolution, ReturnStatus } from "@/features/returns/types"

const resolutionOptions: { label: string; value: ReturnResolution }[] = [
  { label: "Refund", value: "refund" },
  { label: "Replacement", value: "replacement" },
  { label: "Store Credit", value: "store_credit" },
]

const ReturnDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: ret, isLoading } = useAppSelector((state) => state.returns)
  const { data: orders } = useAppSelector((state) => state.orders)

  const [resolution, setResolution] = useState<ReturnResolution | "">("")
  const [refundAmount, setRefundAmount] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) dispatch(fetchReturn(id))
    dispatch(fetchAllOrders({ page: 1, page_size: 100 }))
  }, [dispatch, id])

  const handleApprove = async () => {
    if (!ret || !resolution) return
    setSubmitting(true)
    try {
      await dispatch(
        approveReturn({ id: ret.id, payload: { resolution, refund_amount: refundAmount || undefined } })
      ).unwrap()
      toast.success("Return approved")
    } catch {
      toast.error("Failed to approve return")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!ret || !rejectionReason.trim()) return
    setSubmitting(true)
    try {
      await dispatch(rejectReturn({ id: ret.id, payload: { rejection_reason: rejectionReason.trim() } })).unwrap()
      toast.success("Return rejected")
    } catch {
      toast.error("Failed to reject return")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkReceived = async () => {
    if (!ret) return
    setSubmitting(true)
    try {
      await dispatch(markReturnReceived(ret.id)).unwrap()
      toast.success("Return marked as received")
    } catch {
      toast.error("Failed to update return")
    } finally {
      setSubmitting(false)
    }
  }

  const handleProcess = async () => {
    if (!ret) return
    setSubmitting(true)
    try {
      await dispatch(processReturn(ret.id)).unwrap()
      toast.success("Return processed")
    } catch {
      toast.error("Failed to process return")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading return...</div>
  }

  if (!ret || ret.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Return not found</h2>
        <Button asChild className="mt-6">
          <Link to="/returns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Returns
          </Link>
        </Button>
      </div>
    )
  }

  const order = orders.find((o) => o.id === ret.order)
  const canApproveReject = ret.status === "pending_review"
  const canMarkReceived: ReturnStatus[] = ["approved", "awaiting_return", "in_transit"]
  const canMarkReceivedNow = canMarkReceived.includes(ret.status)
  const canProcess = ret.status === "received"

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/returns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Return Details</h1>
          <p className="text-muted-foreground text-sm">
            {ret.return_number}
            {order && (
              <>
                {" · Order "}
                <Link to={`/order_detail/${order.id}`} className="text-primary">
                  {order.order_number}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Return Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">{ret.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reason</span>
              <span className="capitalize">{ret.reason.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resolution</span>
              <span className="capitalize">{ret.resolution?.replace("_", " ") || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Refund Amount</span>
              <span>{ret.refund_amount ? `$${Number(ret.refund_amount).toFixed(2)}` : "—"}</span>
            </div>
            {ret.comments && (
              <div className="text-sm pt-2">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Customer Comments</p>
                <p>{ret.comments}</p>
              </div>
            )}
            {ret.rejection_reason && (
              <div className="text-sm pt-2">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Rejection Reason</p>
                <p className="text-destructive">{ret.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          {canApproveReject && (
            <>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="resolution">Resolution</FieldLabel>
                  <FieldContent>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as ReturnResolution)}>
                      <SelectTrigger id="resolution">
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                {resolution === "refund" && (
                  <Field>
                    <FieldLabel htmlFor="refund_amount">Refund Amount</FieldLabel>
                    <FieldContent>
                      <Input
                        id="refund_amount"
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                      />
                    </FieldContent>
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="rejection_reason">Rejection Reason (if rejecting)</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="rejection_reason"
                      placeholder="Reason for rejection"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </FieldContent>
                </Field>
              </CardContent>
              <CardFooter className="justify-end gap-3">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={submitting || !rejectionReason.trim()}
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button disabled={submitting || !resolution} onClick={handleApprove}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </CardFooter>
            </>
          )}

          {!canApproveReject && (canMarkReceivedNow || canProcess) && (
            <CardContent className="space-y-3">
              {canMarkReceivedNow && (
                <Button className="w-full" disabled={submitting} onClick={handleMarkReceived}>
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Mark as Received
                </Button>
              )}
              {canProcess && (
                <Button className="w-full" disabled={submitting} onClick={handleProcess}>
                  <Cog className="h-4 w-4 mr-2" />
                  Process Return
                </Button>
              )}
            </CardContent>
          )}

          {!canApproveReject && !canMarkReceivedNow && !canProcess && (
            <CardContent>
              <p className="text-sm text-muted-foreground">No further actions available for this return.</p>
            </CardContent>
          )}
        </Card>
      </div>

      {ret.status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ret.status_history.map((entry, idx) => (
              <div key={idx} className="text-sm flex justify-between border-b border-border pb-2 last:border-0">
                <span>{entry.from_status || "—"} → {entry.to_status}</span>
                <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReturnDetail
