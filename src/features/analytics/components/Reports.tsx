import { DownloadIcon } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import React from 'react'
import { RevenueOrdersChart } from './RevenueOrdersChart'

const Reports = () => {
  return (
    <div className='section-container'>
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
      <RevenueOrdersChart/>
    </div>
  )
}

export default Reports