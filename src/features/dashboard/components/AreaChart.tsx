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

export const description = "A simple area chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "#14b8a6",
  },
} satisfies ChartConfig

export function ChartAreaDefault() {
  return (
    <Card className="rounded-xl border border-gray-100 bg-white p-5 shadow-none dark:border-[#16312b] dark:bg-[#0b1a17]">
      <CardHeader className="mb-4 flex flex-row items-center justify-between gap-4 px-0">
        <div>
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-white/90">
            Revenue Over Time
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-gray-400">
            Tracking performance across global regions
          </CardDescription>
        </div>
        <select className="h-9 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 outline-none transition-colors hover:bg-gray-50 dark:border-[#1e413a] dark:bg-[#0b1a17] dark:text-gray-400 dark:hover:bg-gray-800">
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
          <option>Last 3 Months</option>
        </select>
      </CardHeader>

      <CardContent className="px-0">
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
              tickFormatter={(value) => value.slice(0, 3)}
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
      </CardContent>
    </Card>
  )
}
