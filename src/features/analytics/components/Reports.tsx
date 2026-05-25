import { DownloadIcon } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import React from 'react'
import { RevenueOrdersChart } from './RevenueOrdersChart'
import { SalesByCategoryChart } from './SalesByCategoryChart'
import { OrderStatusChart } from './OrderStatusChart'
import { AnalyticsSummary } from './AnalyticsSummary'
import { PaymentMethodChart } from './PaymentMethodChart'

const Reports = () => {
  return (
    <div className='section-container space-y-8'>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Reports & Analytics
          </h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Comprehensive insights across your enterprise operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <ActionButton variant="download" icon={DownloadIcon}>
              Download Report
            </ActionButton>
        </div>
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