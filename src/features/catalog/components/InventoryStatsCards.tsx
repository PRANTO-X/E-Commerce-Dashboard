import {
  Package2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  Boxes,
} from "lucide-react"

const stats = [
  {
    title: "Total Products",
    value: "1,284",
    change: "+12%",
    description: "Added this month",
    icon: Package2,
    iconStyle: "text-primary",
    badgeStyle:
      "bg-primary/10 text-primary border border-primary/20",
    cardGlow: "from-primary/10",
  },
  {
    title: "Low Stock",
    value: "42",
    change: "-8%",
    description: "Need restock soon",
    icon: AlertTriangle,
    iconStyle: "text-orange-400",
    badgeStyle:
      "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    cardGlow: "from-orange-500/10",
  },
  {
    title: "Out of Stock",
    value: "07",
    change: "+2",
    description: "Products unavailable",
    icon: XCircle,
    iconStyle: "text-red-400",
    badgeStyle:
      "bg-red-500/10 text-red-400 border border-red-500/20",
    cardGlow: "from-red-500/10",
  },
  {
    title: "Total Categories",
    value: "24",
    change: "+3",
    description: "New categories added",
    icon: Boxes,
    iconStyle: "text-emerald-400",
    badgeStyle:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cardGlow: "from-emerald-500/10",
  },
]

const InventoryStatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
          >
            {/* Glow Effect */}
            <div
              className={`absolute inset-0 bg-linear-to-bl ${stat.cardGlow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Top Section */}
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <h3 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.badgeStyle}`}
              >
                <Icon className={`h-6 w-6 ${stat.iconStyle}`} />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="relative mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${stat.badgeStyle}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </span>

                <span className="text-muted-foreground">
                  {stat.description}
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default InventoryStatsCards