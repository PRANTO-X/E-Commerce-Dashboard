import { useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAnalyticsSales } from "@/features/analytics/slices/analyticsSlice"
import { EmptyState } from "@/components/common/EmptyState"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "#14b8a6",
  },
} satisfies ChartConfig

export function ChartAreaDefault() {
  const dispatch = useAppDispatch()
  const { sales } = useAppSelector((state) => state.analytics)
  const orders = useAppSelector((state) => state.orders.data)

  useEffect(() => {
    dispatch(fetchAnalyticsSales())
  }, [dispatch])

  // Derive dynamic chart data from API analytics sales, or fallback to real orders grouped by period
  const chartData = sales && sales.length > 0
    ? sales.map((point) => ({
        month: new Date(point.period).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        desktop: Number(point.revenue),
      }))
    : orders.length > 0
      ? orders.slice(-6).map((ord) => ({
          month: new Date(ord.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          desktop: Number(ord.total_amount || 0),
        }))
      : []

  return (
    <Card className="rounded-xl border border-gray-100 bg-white p-5 shadow-none dark:border-border dark:bg-card">
      <CardHeader className="mb-4 flex flex-row items-center justify-between gap-4 px-0">
        <div>
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-white/90">
            Revenue Over Time
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-gray-400">
            Real-time performance across active periods
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {chartData.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No sales revenue data yet"
            description="Process transactions to generate automated revenue trend visualization."
            className="py-12"
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-60 w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12, top: 10 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--chart-grid, #e5e7eb)"
                className="dark:[--chart-grid:#1f2937]"
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value)}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />

              <ChartTooltip
                cursor={{ stroke: "#14b8a6", strokeOpacity: 0.3, strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="line" />}
              />

              <Area
                dataKey="desktop"
                type="monotone"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#14b8a6", strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
