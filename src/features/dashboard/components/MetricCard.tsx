import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: LucideIcon
}

function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <div className="flex flex-col gap-3 p-5">
      {/* top row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center justify-center rounded-full border-2 border-gray-100 dark:border-gray-800">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <Icon className="size-4 text-primary-500" />
          </span>
        </span>

        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isPositive
              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-500"
              : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>

      {/* value + label */}
      <div>
        <p className="text-[28px] font-medium leading-none text-gray-800 dark:text-white/90">
          {value}
        </p>
        <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-400">
          {title}
        </p>
      </div>
    </div>
  )
}
export default MetricCard
