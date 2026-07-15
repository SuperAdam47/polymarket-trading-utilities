import { useState } from 'react'
import { ProfileSummaryCard } from '@/features/polymarket/profile/profile-summary-card'
import { PortfolioPnlChart } from '@/features/polymarket/portfolio/portfolio-pnl-chart'
import { ProfilePositionsSection } from '@/features/polymarket/profile/profile-positions-section'
import { HistoryPanel } from '@/features/polymarket/portfolio/history-tab'
import { cn } from '@/lib/utils'

type ProfileSectionTab = 'positions' | 'activity'

export function ProfilePage() {
  const [sectionTab, setSectionTab] = useState<ProfileSectionTab>('positions')

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      <div className='grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2'>
        <ProfileSummaryCard />
        <PortfolioPnlChart />
      </div>

      <div>
        <div className='mb-4 flex items-center gap-4 border-b border-border'>
          {(['positions', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              type='button'
              onClick={() => setSectionTab(tab)}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium capitalize transition-colors',
                sectionTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {sectionTab === 'positions' && <ProfilePositionsSection />}

        {sectionTab === 'activity' && <HistoryPanel />}
      </div>
    </div>
  )
}
