import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    label: "Desktop",
    color: "#a78bfa",
  },
} satisfies ChartConfig

export function ChartAreaDefault() {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Revenue Over Time
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-0.5">
            Tracking performance across global regions
          </CardDescription>
        </div>
        <select className="text-xs bg-card border border-border shadow-sm text-muted-foreground rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition-colors">
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
          <option>Last 3 Months</option>
        </select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 10 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fill: "#8888aa", fontSize: 12 }}
            />

            <ChartTooltip
              cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Area
              dataKey="desktop"
              type="natural"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}