import { useEffect } from "react"
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

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#3758f9",
      dark: "#5e84fc",
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
  const { sales } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalyticsSales())
  }, [dispatch])

  const chartData = sales.map((point) => ({
    period: new Date(point.period).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
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
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            No sales data yet.
          </div>
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
