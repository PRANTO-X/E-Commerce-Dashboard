import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, RotateCcw, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchPayment, refundPayment } from "@/features/payments/slices/paymentSlice"
import type { PaymentTransactionState } from "@/features/payments/types"

const statusStyles: Record<PaymentTransactionState, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  succeeded: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const PaymentDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: payment, isLoading } = useAppSelector((state) => state.payments)

  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null)

  useEffect(() => {
    if (id) dispatch(fetchPayment(id))
  }, [dispatch, id])

  // Prefill the refund amount once per loaded payment, without syncing via an effect.
  if (payment && payment.id !== prefilledFor) {
    setPrefilledFor(payment.id)
    setRefundAmount(payment.amount)
  }

  const handleRefund = async () => {
    if (!payment || !refundAmount.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        refundPayment({ id: payment.id, payload: { amount: refundAmount, reason: refundReason.trim() } })
      ).unwrap()
      toast.success("Refund processed")
      setRefundReason("")
    } catch {
      toast.error("Failed to process refund")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading payment...</div>
  }

  if (!payment || payment.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Payment not found</h2>
        <Button asChild className="mt-6">
          <Link to="/payments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/payments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-muted-foreground text-sm">
            Order <Link to={`/order_detail/${payment.order.id}`} className="text-primary">{payment.order.order_number}</Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="capitalize">{payment.provider.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{payment.currency} {Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className={statusStyles[payment.status]}>
                {payment.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processed At</span>
              <span>{payment.processed_at ? new Date(payment.processed_at).toLocaleString() : "—"}</span>
            </div>
            {payment.failure_reason && (
              <div className="text-sm">
                <span className="text-muted-foreground">Failure Reason</span>
                <p className="text-destructive mt-1">{payment.failure_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Field>
              <FieldLabel htmlFor="refund_reason">Reason</FieldLabel>
              <FieldContent>
                <Textarea
                  id="refund_reason"
                  placeholder="Reason for refund"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleRefund} disabled={submitting || !refundAmount.trim()}>
              Process Refund
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default PaymentDetail
