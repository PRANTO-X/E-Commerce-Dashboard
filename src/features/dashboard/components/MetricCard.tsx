import { TrendingUp,TrendingDown } from "lucide-react"
function MetricCard({ title, value, change, icon: Icon }: typeof metrics[0]) {
  const isPositive = change >= 0

  return (
    <div className="relative rounded-2xl p-5 flex flex-col gap-4 overflow-hidden
      bg-card border border-border
      shadow-sm
      hover:shadow-md hover:border-primary/30
      transition-all duration-300">

      {/* soft glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* top row */}
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-muted border border-border">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
          isPositive
            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
            : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>

      {/* value + label */}
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
      </div>
    </div>
  )
}
export default MetricCard
