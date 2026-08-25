import { useEffect } from "react"
import { Pie, PieChart } from "recharts"
import { ShoppingBag } from "lucide-react"

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
import { fetchAll } from "@/features/sales/slices/orderSlice"
import type { OrderStatus } from "@/features/sales/types"
import { STATUS_TONE_HEX, getStatusTone } from "@/components/common/StatusBadge"

export function OrderStatusChart() {
  const dispatch = useAppDispatch()
  const { data: orders } = useAppSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  const counts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    fill: `var(--color-${status})`,
  }))

  const chartConfig = Object.fromEntries([
    ["count", { label: "Count" }],
    ...Object.keys(counts).map((status) => [
      status,
      { label: status.replace("_", " "), color: STATUS_TONE_HEX[getStatusTone(status as OrderStatus)] },
    ]),
  ])

  return (
    <Card className="flex flex-col border-border/50 bg-card h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
        <CardDescription>Current state of all orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Status breakdown will appear when orders are created."
            className="py-10"
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={0}
                outerRadius={80}
                strokeWidth={2}
                stroke="var(--card)"
                labelLine={false}
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
