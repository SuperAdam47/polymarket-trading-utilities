import { cn } from '@/lib/utils'
import type { PortfolioTab } from '@/lib/polymarket/types'

type TabBarProps = {
  activeTab: PortfolioTab
  onTabChange: (tab: PortfolioTab) => void
}

const TABS: { id: PortfolioTab; label: string }[] = [
  { id: 'positions', label: 'Positions' },
  { id: 'Open orders', label: 'Open' },
  { id: 'history', label: 'History' },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      role='group'
      aria-orientation='horizontal'
      className='pm-switch-group'
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type='button'
            aria-pressed={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn('pm-switch-item', isActive && 'pm-switch-item-active')}
          >
            {isActive ? (
              <div
                className='absolute inset-0 bg-white/[0.08]'
                style={{ borderRadius: 'inherit', opacity: 1 }}
              />
            ) : null}
            <span className='relative z-10 px-1.5'>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
