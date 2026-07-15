import { PortfolioSummary } from './portfolio-summary'
import { PortfolioPnlChart } from './portfolio-pnl-chart'

export function PortfolioSummarySection() {
  return (
    <div className='grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2'>
      <PortfolioSummary />
      <PortfolioPnlChart />
    </div>
  )
}
