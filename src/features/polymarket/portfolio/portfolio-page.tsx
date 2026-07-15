import { useNavigate } from '@tanstack/react-router'
import { PortfolioSummarySection } from './portfolio-summary-section'
import { PositionsTab } from './positions-tab'
import { OpenOrdersTab } from './open-orders-tab'
import { HistoryTab } from './history-tab'
import { RedemptionBanner } from './redemption-banner'
import type { PortfolioTab } from '@/lib/polymarket/types'

type PortfolioPageProps = {
  tab: PortfolioTab
}

export function PortfolioPage({ tab }: PortfolioPageProps) {
  const navigate = useNavigate()

  const handleTabChange = (newTab: PortfolioTab) => {
    navigate({ to: '/portfolio', search: { tab: newTab } })
  }

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      <PortfolioSummarySection />
      <RedemptionBanner />
      {tab === 'positions' && (
        <PositionsTab activeTab={tab} onTabChange={handleTabChange} />
      )}
      {tab === 'Open orders' && (
        <OpenOrdersTab activeTab={tab} onTabChange={handleTabChange} />
      )}
      {tab === 'history' && (
        <HistoryTab activeTab={tab} onTabChange={handleTabChange} />
      )}
    </div>
  )
}
