"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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
} from "@/components/ui/chart"

const chartData = [
  { method: "Credit Card", percentage: 45, fill: "var(--color-credit-card)" },
  { method: "PayPal", percentage: 30, fill: "var(--color-paypal)" },
  { method: "Apple Pay", percentage: 20, fill: "var(--color-apple-pay)" },
  { method: "Google Pay", percentage: 15, fill: "var(--color-google-pay)" },
  { method: "Other", percentage: 5, fill: "var(--color-other)" },
]

const chartConfig = {
  percentage: {
    label: "Usage",
  },
  "credit-card": {
    label: "Credit Card",
    color: "#7c3aed",
  },
  paypal: {
    label: "PayPal",
    color: "#3b82f6",
  },
  "apple-pay": {
    label: "Apple Pay",
    color: "#10b981",
  },
  "google-pay": {
    label: "Google Pay",
    color: "#f59e0b",
  },
  other: {
    label: "Other",
    color: "#6b7280",
  },
}

export function PaymentMethodChart() {
  return (
    <Card className="border-border/50 bg-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
        <CardDescription>Preferred payment options distribution</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 12,
              left: 12,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="method"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => value.split(" ")[0]}
            />
            <YAxis hide domain={[0, 100]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="percentage"
              fill="var(--color-credit-card)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="percentage"
                position="top"
                offset={12}
                className="fill-foreground font-mono text-xs"
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
            {chartData.map((item) => (
                <div key={item.method} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartConfig[item.method.toLowerCase().replace(/\s+/g, "-") as keyof typeof chartConfig]?.color as string }} />
                    <span className="text-xs text-muted-foreground">{item.method}</span>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
