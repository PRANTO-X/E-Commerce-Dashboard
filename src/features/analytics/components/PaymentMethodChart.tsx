import { useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

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
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAllPayments } from "@/features/payments/slices/paymentSlice"
import type { PaymentProvider } from "@/features/payments/types"

const providerLabels: Record<PaymentProvider, string> = {
  stripe: "Stripe",
  cash_on_delivery: "Cash on Delivery",
}

const palette = ["#3758f9", "#3b82f6", "#10b981", "#f59e0b", "#6b7280"]

export function PaymentMethodChart() {
  const dispatch = useAppDispatch()
  const { data: payments } = useAppSelector((state) => state.payments)

  useEffect(() => {
    dispatch(fetchAllPayments())
  }, [dispatch])

  const counts = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.provider] = (acc[payment.provider] ?? 0) + 1
    return acc
  }, {})

  const total = payments.length
  const chartData = Object.entries(counts).map(([provider, count], i) => ({
    method: providerLabels[provider as PaymentProvider] ?? provider,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    fill: palette[i % palette.length],
  }))

  const chartConfig: Record<string, { label: string; color?: string }> = Object.fromEntries([
    ["percentage", { label: "Usage" }],
    ...chartData.map((d, i) => [d.method, { label: d.method, color: palette[i % palette.length] }]),
  ])

  return (
    <Card className="border-border/50 bg-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
        <CardDescription>Preferred payment options distribution</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-sm text-muted-foreground">
            No payments yet.
          </div>
        ) : (
          <>
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
                />
                <YAxis hide domain={[0, 100]} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry) => (
                    <Cell key={entry.method} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    position="top"
                    offset={12}
                    className="fill-foreground font-mono text-xs"
                    formatter={(value) => `${value}%`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {chartData.map((item) => (
                <div key={item.method} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground">{item.method}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
