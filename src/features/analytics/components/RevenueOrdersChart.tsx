import { useCallback, useEffect } from "react"
import { EmptyState } from "@/components/common/EmptyState"
import { BarChart3 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAnalyticsSales } from "@/features/analytics/slices/analyticsSlice"
import { parseDate } from "@/lib/format"
import { ChartError, ChartLoading } from "./ChartState"

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#14b8a6",
      dark: "#2dd4bf",
    },
  },
  order_count: {
    label: "Orders",
    theme: {
      light: "#10b981",
      dark: "#34d399",
    },
  },
}

export function RevenueOrdersChart() {
  const dispatch = useAppDispatch()
  const { sales, requests } = useAppSelector((state) => state.analytics)
  const request = requests.sales

  const load = useCallback(() => dispatch(fetchAnalyticsSales()), [dispatch])

  useEffect(() => {
    const pending = load()
    return () => pending.abort()
  }, [load])

  // Periods are "YYYY-MM" month buckets; parse them as local dates (new Date("2024-05") is UTC
  // midnight, which renders as the previous month west of UTC).
  const chartData = sales.map((point) => ({
    period:
      parseDate(point.period)?.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) ?? point.period,
    revenue: point.revenue,
    order_count: point.order_count,
  }))

  return (
    <Card className="border-border/50 bg-card overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold">
          Revenue vs. Orders
        </CardTitle>
        <CardDescription>
          Sales performance by period
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[300px] sm:h-[400px] px-2 sm:px-6">
        {request.status === "failed" ? (
          <ChartError error={request.error} onRetry={load} className="h-full py-0" />
        ) : request.status !== "succeeded" && chartData.length === 0 ? (
          <ChartLoading className="h-full py-0" />
        ) : chartData.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No sales revenue data"
            description="Sales and order trend data will display here automatically once orders are placed."
            className="h-full py-0"
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />

                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />

                <ChartTooltip
                  cursor={{ fill: "var(--muted/20)" }}
                  content={<ChartTooltipContent />}
                />

                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />

                <Bar
                  dataKey="order_count"
                  fill="var(--color-order_count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
