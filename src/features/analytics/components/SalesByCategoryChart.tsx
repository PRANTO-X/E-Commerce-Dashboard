import { useCallback, useEffect } from "react"
import { Pie, PieChart } from "recharts"
import { Package } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchTopProducts } from "@/features/analytics/slices/analyticsSlice"
import { ChartError, ChartLoading } from "./ChartState"

const palette = ["#14b8a6", "#f59e0b", "#38bdf8", "#f43f5e", "#8b5cf6", "#94a3b8"]

export function SalesByCategoryChart() {
  const dispatch = useAppDispatch()
  const { topProducts, requests } = useAppSelector((state) => state.analytics)
  const request = requests.topProducts

  const load = useCallback(() => dispatch(fetchTopProducts()), [dispatch])

  useEffect(() => {
    const pending = load()
    return () => pending.abort()
  }, [load])

  const chartData = topProducts.slice(0, 6).map((product, i) => ({
    product: product.product__name,
    revenue: product.total_revenue,
    fill: palette[i % palette.length],
  }))

  const chartConfig = Object.fromEntries([
    ["revenue", { label: "Revenue" }],
    ...chartData.map((d, i) => [d.product, { label: d.product, color: palette[i % palette.length] }]),
  ])

  return (
    <Card className="flex flex-col border-border/50 bg-card h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-lg font-semibold">Top Products by Revenue</CardTitle>
        <CardDescription>Best-selling products this period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {request.status === "failed" ? (
          <ChartError error={request.error} onRetry={load} />
        ) : request.status !== "succeeded" && chartData.length === 0 ? (
          <ChartLoading />
        ) : chartData.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No top products yet"
            description="Revenue distribution per product will calculate automatically."
            className="py-10"
          />
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="revenue"
                nameKey="product"
                innerRadius={60}
                strokeWidth={5}
                labelLine={false}
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="product" className="-translate-y-2 flex-wrap" />}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
