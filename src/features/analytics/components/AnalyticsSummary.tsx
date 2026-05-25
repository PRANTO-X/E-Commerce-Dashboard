import React from "react"
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"

export function AnalyticsSummary() {
  const metrics = [
    {
      id: "net-revenue",
      title: "Net Revenue",
      value: "$84,230.00",
      change: +15.2,
      icon: DollarSign,
    },
    {
      id: "avg-order",
      title: "Avg. Order Value",
      value: "$124.50",
      change: +4.8,
      icon: ShoppingBag,
    },
    {
      id: "retention",
      title: "Customer Retention",
      value: "68.2%",
      change: +2.4,
      icon: Users,
    },
    {
      id: "conversion",
      title: "Conversion Rate",
      value: "3.42%",
      change: -0.5,
      icon: Activity,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  )
}
