

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
  { category: "electronics", sales: 400, fill: "var(--color-electronics)" },
  { category: "clothing", sales: 300, fill: "var(--color-clothing)" },
  { category: "home", sales: 300, fill: "var(--color-home)" },
  { category: "beauty", sales: 200, fill: "var(--color-beauty)" },
  { category: "others", sales: 100, fill: "var(--color-others)" },
]

const chartConfig = {
  sales: {
    label: "Sales",
  },
  electronics: {
    label: "Electronics",
    color: "#7c3aed",
  },
  clothing: {
    label: "Clothing",
    color: "#10b981",
  },
  home: {
    label: "Home",
    color: "#f59e0b",
  },
  beauty: {
    label: "Beauty",
    color: "#3b82f6"
  },
  others: {
    label: "Others",
    color: "#6b7280"
  }
}

export function SalesByCategoryChart() {
  return (
    <Card className="flex flex-col border-border/50 bg-card h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
        <CardDescription>Distribution of revenue across categories</CardDescription>
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
              dataKey="sales"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
