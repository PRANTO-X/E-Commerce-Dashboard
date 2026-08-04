import { useEffect } from "react"
import { DollarSign, ShoppingBag, Receipt, Undo2 } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAnalyticsSummary, fetchReturnsSummary } from "@/features/analytics/slices/analyticsSlice"

// Real analytics endpoints have no period-over-period comparison data, so `change` is
// always 0 here rather than a fabricated trend percentage.
export function AnalyticsSummary() {
  const dispatch = useAppDispatch()
  const { summary, returns } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalyticsSummary())
    dispatch(fetchReturnsSummary())
  }, [dispatch])

  const metrics = [
    {
      id: "net-revenue",
      title: "Total Revenue",
      value: `$${Number(summary?.total_revenue ?? 0).toFixed(2)}`,
      change: 0,
      icon: DollarSign,
    },
    {
      id: "avg-order",
      title: "Avg. Order Value",
      value: `$${Number(summary?.average_order_value ?? 0).toFixed(2)}`,
      change: 0,
      icon: ShoppingBag,
    },
    {
      id: "total-orders",
      title: "Total Orders",
      value: String(summary?.total_orders ?? 0),
      change: 0,
      icon: Receipt,
    },
    {
      id: "return-rate",
      title: "Return Rate",
      value: `${Number(returns?.return_rate ?? summary?.return_rate ?? 0).toFixed(2)}%`,
      change: 0,
      icon: Undo2,
    },
  ]

  return (
    <div className="grid grid-cols-1 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100 bg-white sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  )
}
