import { useEffect } from "react"
import { Pie, PieChart } from "recharts"

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
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchTopProducts } from "@/features/analytics/slices/analyticsSlice"

const palette = ["#3758f9", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#6b7280"]

export function SalesByCategoryChart() {
  const dispatch = useAppDispatch()
  const { topProducts } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchTopProducts())
  }, [dispatch])

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
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground py-12">
            No sales data yet.
          </div>
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
                content={<ChartLegendContent nameKey="product" />}
                className="-translate-y-2 flex-wrap"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
