import React from "react"
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react"
import MetricCard from "@/features/dashboard/components/MetricCard"
import { ChartAreaDefault } from "./AreaChart"
const Dashboard = () => {
  const metrics = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: "$128,430",
      change: +12.5,
      icon: DollarSign,
    },
    {
      id: "orders",
      title: "Orders Today",
      value: "1,240",
      change: +8.2,
      icon: ShoppingCart,
    },
    {
      id: "customers",
      title: "Active Customers",
      value: "45,210",
      change: +2.4,
      icon: Users,
    },
    {
      id: "inventory",
      title: "Inventory Value",
      value: "$842k",
      change: -1.5,
      icon: Package,
    },
  ]

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 mx-auto space-y-3.5">
      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl  font-bold">
            Overview
          </h1>
          <p className="font-text text-accent-foreground text-sm">
            Real-time performance metrics for your enterprise.
          </p>
        </div>

        <div className="space-x-2.5">
          <button className="bg-popover border border-border p-2 rounded-lg cursor-pointer">
            Download Report
          </button>
          <button className="bg-primary text-secondary border border-border p-2 rounded-lg cursor-pointer">
            Create New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>
      <div>
        <ChartAreaDefault />
      </div>
    </div>
  )
}

export default Dashboard
