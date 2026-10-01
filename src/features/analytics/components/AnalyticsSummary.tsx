import { useEffect } from "react"
import { DollarSign, ShoppingBag, Receipt, Undo2 } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAnalyticsSummary, fetchReturnsSummary } from "@/features/analytics/slices/analyticsSlice"
import { formatCurrency } from "@/lib/format"

// Real analytics endpoints have no period-over-period comparison data, so `change` is
// always 0 here rather than a fabricated trend percentage.
export function AnalyticsSummary() {
  const dispatch = useAppDispatch()
  const { summary, returns, requests } = useAppSelector((state) => state.analytics)
  // Show "—" rather than a fabricated $0.00 when the request failed or hasn't returned yet.
  const hasSummary = summary !== null
  const hasReturnRate = returns !== null || hasSummary

  useEffect(() => {
    dispatch(fetchAnalyticsSummary())
    dispatch(fetchReturnsSummary())
  }, [dispatch])

  const metrics = [
    {
      id: "net-revenue",
      title: "Total Revenue",
      value: hasSummary ? formatCurrency(summary.total_revenue) : "—",
      change: 0,
      icon: DollarSign,
    },
    {
      id: "avg-order",
      title: "Avg. Order Value",
      value: hasSummary ? formatCurrency(summary.average_order_value) : "—",
      change: 0,
      icon: ShoppingBag,
    },
    {
      id: "total-orders",
      title: "Total Orders",
      value: hasSummary ? summary.total_orders.toLocaleString() : "—",
      change: 0,
      icon: Receipt,
    },
    {
      id: "return-rate",
      title: "Return Rate",
      value: hasReturnRate ? `${Number(returns?.return_rate ?? summary?.return_rate ?? 0).toFixed(2)}%` : "—",
      change: 0,
      icon: Undo2,
    },
  ]

  const failed = requests.summary.status === "failed" || requests.returns.status === "failed"

  return (
    <div className="space-y-3">
    {failed && (
      <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
        Some summary metrics couldn't be loaded.
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (requests.summary.status === "failed") dispatch(fetchAnalyticsSummary())
            if (requests.returns.status === "failed") dispatch(fetchReturnsSummary())
          }}
        >
          Retry
        </Button>
      </div>
    )}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
    </div>
  )
}
