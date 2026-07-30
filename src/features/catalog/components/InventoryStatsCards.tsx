import {
  Package2,
  AlertTriangle,
  XCircle,
  Boxes,
} from "lucide-react"
import { useAppSelector } from "@/app/hooks"

const LOW_STOCK_THRESHOLD = 10

const InventoryStatsCards = () => {
  const { data: variants } = useAppSelector((state) => state.variants)
  const { data: categories } = useAppSelector((state) => state.categories)

  const lowStockCount = variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= LOW_STOCK_THRESHOLD).length
  const outOfStockCount = variants.filter((v) => v.stock_quantity <= 0).length

  const stats = [
    {
      title: "Total Variants",
      value: String(variants.length),
      icon: Package2,
      iconStyle: "text-primary",
      badgeStyle: "bg-primary/10 text-primary border border-primary/20",
      cardGlow: "from-primary/10",
    },
    {
      title: "Low Stock",
      value: String(lowStockCount),
      description: `Threshold: ${LOW_STOCK_THRESHOLD} units`,
      icon: AlertTriangle,
      iconStyle: "text-orange-400",
      badgeStyle: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      cardGlow: "from-orange-500/10",
    },
    {
      title: "Out of Stock",
      value: String(outOfStockCount),
      icon: XCircle,
      iconStyle: "text-red-400",
      badgeStyle: "bg-red-500/10 text-red-400 border border-red-500/20",
      cardGlow: "from-red-500/10",
    },
    {
      title: "Total Categories",
      value: String(categories.length),
      icon: Boxes,
      iconStyle: "text-emerald-400",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      cardGlow: "from-emerald-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
          >
            <div
              className={`absolute inset-0 bg-linear-to-bl ${stat.cardGlow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{stat.value}</h3>
              </div>

              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.badgeStyle}`}>
                <Icon className={`h-6 w-6 ${stat.iconStyle}`} />
              </div>
            </div>

            {stat.description && (
              <div className="relative mt-6">
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default InventoryStatsCards
