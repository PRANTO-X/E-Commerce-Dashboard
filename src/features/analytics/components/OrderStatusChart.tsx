

import * as React from "react"
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

const chartData = [
  { status: "delivered", count: 1250, fill: "var(--color-delivered)" },
  { status: "processing", count: 450, fill: "var(--color-processing)" },
  { status: "shipped", count: 300, fill: "var(--color-shipped)" },
  { status: "cancelled", count: 120, fill: "var(--color-cancelled)" },
]

const chartConfig = {
  count: {
    label: "Count",
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
  },
  processing: {
    label: "Processing",
    color: "#3b82f6",
  },
  shipped: {
    label: "Shipped",
    color: "#f59e0b",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
  },
}

export function OrderStatusChart() {
  return (
    <Card className="flex flex-col border-border/50 bg-card h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
        <CardDescription>Current state of all orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
