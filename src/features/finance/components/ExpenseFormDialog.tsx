import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CheckCircle2, Loader2, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import { ImageUploader } from "@/components/common/ImageUploader"
import { useAppDispatch } from "@/app/hooks"
import { postData, updateData } from "@/features/finance/slices/expenseSlice"
import type { Expense } from "@/features/finance/types"
import {
  categoryConfig,
  expenseSchema,
  paymentMethodLabels,
  type ExpenseFormValues,
} from "@/features/finance/expenseConfig"
import { todayLocalISODate } from "@/lib/format"

function valuesFor(expense: Expense | null): ExpenseFormValues {
  if (expense) {
    return {
      title: expense.title,
      category: expense.category,
      amount: String(expense.amount),
      vendor: expense.vendor,
      payment_method: expense.payment_method,
      status: expense.status,
      date: expense.date,
      reference_no: expense.reference_no || "",
      receipt_url: expense.receipt_url || "",
      notes: expense.notes || "",
    }
  }
  return {
    title: "",
    category: "inventory",
    amount: "",
    vendor: "",
    payment_method: "credit_card",
    status: "paid",
    date: todayLocalISODate(),
    reference_no: `EXP-${Date.now().toString().slice(-6)}`,
    receipt_url: "",
    notes: "",
  }
}

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Record being edited, or null to create a new one. */
  expense: Expense | null
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const dispatch = useAppDispatch()

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: valuesFor(expense),
  })

  // Re-seed the form each time the dialog opens (fresh defaults for create, record for edit).
  useEffect(() => {
    if (open) reset(valuesFor(expense))
  }, [open, expense, reset])

  const onSubmit = async (values: ExpenseFormValues) => {
    const payload = {
      title: values.title,
      category: values.category,
      amount: Number(values.amount),
      vendor: values.vendor,
      payment_method: values.payment_method,
      status: values.status,
      date: values.date,
      reference_no: values.reference_no.trim() || undefined,
      receipt_url: values.receipt_url.trim() || undefined,
      notes: values.notes.trim() || undefined,
      created_at: expense?.created_at || new Date().toISOString(),
    }

    try {
      if (expense) {
        await dispatch(updateData({ id: expense.id, payload })).unwrap()
        toast.success(`Expense "${values.title}" updated`)
      } else {
        await dispatch(postData({ payload })).unwrap()
        toast.success(`Expense "${values.title}" recorded successfully`)
      }
      onOpenChange(false)
    } catch {
      toast.error("Failed to save expense")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {expense ? "Edit Expense Record" : "Record New Business Expense"}
          </DialogTitle>
          <DialogDescription>
            Record vendor payments, inventory costs, SaaS tools, and upload invoice receipts.
          </DialogDescription>
        </DialogHeader>

        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 py-2">
          <Field>
            <FieldLabel htmlFor="exp-title">Expense Title / Description *</FieldLabel>
            <FieldContent>
              <Input
                id="exp-title"
                placeholder="e.g. Bulk Poly Mailer Bags Restock"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="exp-category">Expense Category *</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="exp-category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            {val.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exp-amount">Amount ($ USD) *</FieldLabel>
              <FieldContent>
                <Input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  {...register("amount")}
                />
                <FieldError errors={[errors.amount]} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="exp-vendor">Vendor / Payee *</FieldLabel>
              <FieldContent>
                <Input
                  id="exp-vendor"
                  placeholder="e.g. DHL, Google, Supplier Ltd"
                  aria-invalid={!!errors.vendor}
                  {...register("vendor")}
                />
                <FieldError errors={[errors.vendor]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exp-date">Expense Date *</FieldLabel>
              <FieldContent>
                <Input id="exp-date" type="date" aria-invalid={!!errors.date} {...register("date")} />
                <FieldError errors={[errors.date]} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="exp-method">Payment Method</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="payment_method"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="exp-method">
                        <SelectValue placeholder="Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentMethodLabels).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exp-status">Payment Status</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="exp-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exp-ref">Invoice / Ref #</FieldLabel>
              <FieldContent>
                <Input id="exp-ref" placeholder="e.g. INV-9901" {...register("reference_no")} />
              </FieldContent>
            </Field>
          </div>

          {/* Receipt Upload with ImageUploader */}
          <Field>
            <FieldLabel>Invoice / Receipt Attachment</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="receipt_url"
                render={({ field }) => (
                  <ImageUploader
                    singleMode
                    images={
                      field.value
                        ? [{ id: "expense-receipt", url: field.value, alt: "Expense Receipt", isPrimary: true }]
                        : []
                    }
                    onImagesChange={(imgs) => field.onChange(imgs.length > 0 ? imgs[0].url : "")}
                    onAddImage={(url) => field.onChange(url)}
                    label="Upload Invoice or Receipt"
                    description="Drop receipt photo from device, browse files, or provide invoice URL"
                  />
                )}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="exp-notes">Internal Notes & Context</FieldLabel>
            <FieldContent>
              <Textarea
                id="exp-notes"
                rows={2}
                placeholder="Additional context, department allocation, or approval notes..."
                {...register("notes")}
              />
            </FieldContent>
          </Field>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
            )}
            {expense ? "Save Changes" : "Record Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
