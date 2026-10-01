import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchPayment, refundPayment } from "@/features/payments/slices/paymentSlice"
import type { PaymentTransactionState } from "@/features/payments/types"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { getApiErrorMessage } from "@/lib/api/client"
import { formatCurrency, formatDateTime, humanize } from "@/lib/format"
import { DetailPageState } from "@/components/common/DetailPageState"
import { resolveDetailState } from "@/lib/detailState"

// PaymentTransactionState has no refunded / partially_refunded value and the payment record
// carries no "amount already refunded" field, so only a settled ("succeeded") payment is
// refundable and the ceiling is the captured amount; the backend enforces the true remaining
// balance for repeat partial refunds.
const REFUNDABLE_STATUSES: PaymentTransactionState[] = ["succeeded"]

const PaymentDetail = () => {
  useDocumentTitle("Payment Details")

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData, singleStatus, singleError } = useAppSelector((state) => state.payments)
  const payment = singleData && singleData.id === id ? singleData : null

  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [touched, setTouched] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    if (!id) return undefined
    return dispatch(fetchPayment(id))
  }, [dispatch, id])

  useEffect(() => {
    const request = load()
    return () => request?.abort()
  }, [load])

  const maxRefundable = payment ? Number(payment.amount) || 0 : 0
  const canRefund = !!payment && REFUNDABLE_STATUSES.includes(payment.status) && maxRefundable > 0

  const parsedAmount = Number(refundAmount)
  const amountError = !refundAmount.trim()
    ? "Enter a refund amount"
    : !Number.isFinite(parsedAmount) || parsedAmount <= 0
      ? "Amount must be greater than 0"
      : parsedAmount > maxRefundable
        ? `Amount can't exceed ${formatCurrency(maxRefundable, payment?.currency)}`
        : null

  const resetRefundForm = () => {
    setRefundAmount("")
    setRefundReason("")
    setTouched(false)
  }

  const requestRefund = () => {
    setTouched(true)
    if (!canRefund || amountError) return
    setConfirmOpen(true)
  }

  const handleRefund = async () => {
    if (!payment || !canRefund || amountError) return
    setSubmitting(true)
    try {
      await dispatch(
        refundPayment({
          id: payment.id,
          payload: { amount: parsedAmount.toFixed(2), reason: refundReason.trim() || undefined },
        })
      ).unwrap()
      toast.success("Refund processed")
      resetRefundForm()
      setConfirmOpen(false)
      // Pull the authoritative record (status may change after a refund).
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to process refund"))
    } finally {
      setSubmitting(false)
    }
  }

  const pageState = resolveDetailState(singleStatus, singleError, !!payment)
  if (pageState || !payment) {
    return (
      <DetailPageState
        state={pageState ?? "loading"}
        entity="Payment"
        backTo="/payments"
        backLabel="Back to Payments"
        error={singleError}
        onRetry={() => {
          load()
        }}
      />
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
              <span className="capitalize">{humanize(payment.provider)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={payment.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processed At</span>
              <span>{formatDateTime(payment.processed_at)}</span>
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
          {canRefund ? (
            <>
              <CardContent className="space-y-4">
                <Field data-invalid={touched && !!amountError}>
                  <FieldLabel htmlFor="refund_amount">Refund Amount</FieldLabel>
                  <FieldContent>
                    <Input
                      id="refund_amount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      max={maxRefundable}
                      placeholder={`Up to ${formatCurrency(maxRefundable, payment.currency)}`}
                      value={refundAmount}
                      aria-invalid={touched && !!amountError}
                      aria-describedby="refund_amount_hint"
                      onChange={(e) => setRefundAmount(e.target.value)}
                      onBlur={() => setTouched(true)}
                    />
                    {touched && amountError ? (
                      <FieldError id="refund_amount_hint">{amountError}</FieldError>
                    ) : (
                      <p id="refund_amount_hint" className="text-xs text-muted-foreground">
                        Maximum refundable: {formatCurrency(maxRefundable, payment.currency)}
                      </p>
                    )}
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
                <Button onClick={requestRefund} disabled={submitting}>
                  Process Refund
                </Button>
              </CardFooter>
            </>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Only succeeded payments can be refunded. This payment is{" "}
                <span className="font-medium">{humanize(payment.status)}</span>.
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !submitting && setConfirmOpen(open)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Refund {amountError ? "" : formatCurrency(parsedAmount, payment.currency)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends money back to the customer for order {payment.order.order_number} and can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={submitting}
              onClick={(e) => {
                // Keep the dialog open until the request settles.
                e.preventDefault()
                handleRefund()
              }}
            >
              {submitting ? "Processing..." : "Confirm Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PaymentDetail
