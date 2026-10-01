import { Building2, CreditCard, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Expense } from "@/features/finance/types"
import { categoryConfig, paymentMethodLabels } from "@/features/finance/expenseConfig"
import { parseDate } from "@/lib/format"

interface ExpenseDetailDialogProps {
  expense: Expense | null
  onClose: () => void
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function ExpenseDetailDialog({ expense, onClose, onEdit, onDelete }: ExpenseDetailDialogProps) {
  // `date` is a calendar date ("YYYY-MM-DD"): parse it as local so it doesn't shift a day.
  const incurred = parseDate(expense?.date)

  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      {expense && (
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={categoryConfig[expense.category]?.badgeClass}>
                {categoryConfig[expense.category]?.label}
              </Badge>
              <StatusBadge status={expense.status} />
            </div>
            <DialogTitle className="text-xl font-bold mt-2">{expense.title}</DialogTitle>
            <DialogDescription>
              Reference: <span className="font-mono">{expense.reference_no || "N/A"}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="rounded-lg bg-muted/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs block">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ${Number(expense.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block">Date Incurred</span>
                <span className="font-semibold text-foreground">
                  {incurred
                    ? incurred.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block">Vendor / Payee</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {expense.vendor}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block">Payment Method</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  {paymentMethodLabels[expense.payment_method]}
                </span>
              </div>
            </div>

            {expense.receipt_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Attached Receipt / Invoice
                </span>
                <div className="relative h-48 w-full rounded-lg border border-border overflow-hidden bg-muted/30">
                  <img
                    src={expense.receipt_url}
                    alt="Receipt Document"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}

            {expense.notes && (
              <div className="rounded-lg bg-muted/20 p-3 text-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Notes & Description
                </span>
                <p className="text-muted-foreground text-xs">{expense.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 justify-between">
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(expense)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(expense)}>
                Edit Record
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
