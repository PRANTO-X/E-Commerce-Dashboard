import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RevenueOrdersChart } from "./RevenueOrdersChart"
import { SalesByCategoryChart } from "./SalesByCategoryChart"
import { OrderStatusChart } from "./OrderStatusChart"
import { AnalyticsSummary } from "./AnalyticsSummary"
import { PaymentMethodChart } from "./PaymentMethodChart"

const Reports = () => {
  return (
    <div className="section-container space-y-8 print-area">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive insights across your enterprise operations.
          </p>
        </div>

        <Button variant="primary" size="action" onClick={()=> window.print()}>
          <DownloadIcon className="size-5" />
          Download Report
        </Button>
      </div>

      {/* Summary Metrics */}
      <AnalyticsSummary />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueOrdersChart />
        </div>
        <div className="lg:col-span-1">
          <SalesByCategoryChart />
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OrderStatusChart />
        </div>
        <div className="md:col-span-1 lg:col-span-2">
          <PaymentMethodChart />
        </div>
      </div>
    </div>
  )
}

export default Reports
