import { useCallback } from "react"
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
import { useAppDispatch } from "@/app/hooks"
import { fetchAll } from "@/features/sales/slices/orderSlice"
import type { OrderStatus } from "@/features/sales/types"
import { STATUS_TONE_HEX, getStatusTone } from "@/components/common/status-tones"
import { humanize } from "@/lib/format"
import { useLocalFetch } from "../useLocalFetch"
import { ChartError, ChartLoading } from "./ChartState"

// There is no order-status aggregate endpoint, so the breakdown is computed from one large
// page of orders. When the store has more orders than this, the chart says it's a sample.
const SAMPLE_SIZE = 1000

export function OrderStatusChart() {
  const dispatch = useAppDispatch()
  // Local result, not state.orders.data: other screens put their own page size/filters there.
  const start = useCallback(() => dispatch(fetchAll({ page: 1, page_size: SAMPLE_SIZE })), [dispatch])
  const { status, data, error, retry } = useLocalFetch(start)
  const orders = data?.data ?? []
  const total = data?.total ?? 0
  const isSample = total > orders.length

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
      { label: humanize(status), color: STATUS_TONE_HEX[getStatusTone(status as OrderStatus)] },
    ]),
  ])

  return (
    <Card className="flex flex-col border-border/50 bg-card h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
        <CardDescription>
          {isSample
            ? `Current state of the latest ${orders.length.toLocaleString()} of ${total.toLocaleString()} orders`
            : "Current state of all orders"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {status === "failed" ? (
          <ChartError error={error} onRetry={retry} />
        ) : status === "loading" ? (
          <ChartLoading />
        ) : chartData.length === 0 ? (
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
                content={<ChartLegendContent nameKey="status" className="-translate-y-2 flex-wrap" />}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
