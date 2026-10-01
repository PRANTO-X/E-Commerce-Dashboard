import { useMemo } from "react"
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense, ExpenseCategory } from "@/features/finance/types"
import { categoryConfig } from "@/features/finance/expenseConfig"

export function ExpenseStatsCards({ expenses }: { expenses: Expense[] }) {
  // Metrics calculations
  const metrics = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const paid = expenses
      .filter((e) => e.status === "paid")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const pending = expenses
      .filter((e) => e.status === "pending" || e.status === "approved")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

    const categorySums: Record<string, number> = {}
    expenses.forEach((e) => {
      categorySums[e.category] = (categorySums[e.category] || 0) + Number(e.amount || 0)
    })

    const topCategoryKey = Object.keys(categorySums).reduce(
      (a, b) => (categorySums[a] > categorySums[b] ? a : b),
      "inventory"
    ) as ExpenseCategory

    return {
      total,
      paid,
      pending,
      count: expenses.length,
      topCategory: categoryConfig[topCategoryKey]?.label || "Inventory",
      topCategoryAmount: categorySums[topCategoryKey] || 0,
    }
  }, [expenses])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenditure</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${metrics.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Layers className="h-3 w-3" /> across {metrics.count} recorded entries
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cleared & Paid</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${metrics.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Settled liabilities with receipts
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending / Under Review</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ${metrics.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting authorization or clearing
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Spending Area</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-foreground truncate">
            {metrics.topCategory}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ${metrics.topCategoryAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} total share
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
