"use client"

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

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartData = [
  { month: "Jan", revenue: 4200, orders: 2400 },
  { month: "Feb", revenue: 5800, orders: 3200 },
  { month: "Mar", revenue: 3900, orders: 2100 },
  { month: "Apr", revenue: 6700, orders: 4100 },
  { month: "May", revenue: 5100, orders: 3000 },
  { month: "Jun", revenue: 7400, orders: 4600 },
  { month: "July", revenue: 9000, orders: 5000 },
  { month: "August", revenue: 8400, orders: 7000 },
  { month: "September", revenue: 5900, orders: 4600 },
  { month: "October", revenue: 7900, orders: 6600 },
  { month: "November", revenue: 8200, orders: 3900 },
  { month: "December", revenue: 7800, orders: 3600 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#7c3aed",
      dark: "#a78bfa",
    },
  },
  orders: {
    label: "Orders",
    theme: {
      light: "#10b981",
      dark: "#34d399",
    },
  },
}

export function RevenueOrdersChart() {
  return (
    <Card className="border-border/50 bg-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Revenue vs. Orders
          </CardTitle>
          <CardDescription>
            Visualizing performance trends across timescales
          </CardDescription>
        </div>

        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Tabs defaultValue="monthly" className="w-full overflow-y-hidden">
            <TabsList className="w-full sm:w-auto inline-flex">
              <TabsTrigger value="daily" className="flex-1 sm:flex-none px-3">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1 sm:flex-none px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1 sm:flex-none px-3">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="flex-1 sm:flex-none px-3">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="h-[300px] sm:h-[400px] px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border/50"
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                tickFormatter={(value) => value.slice(0, 3)}
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
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}