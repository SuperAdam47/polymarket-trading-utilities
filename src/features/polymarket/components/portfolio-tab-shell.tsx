import type { ReactNode } from 'react'
import { PortfolioToolbarScroll } from '@/features/polymarket/components/portfolio-toolbar-scroll'
import { TabBar } from '@/features/polymarket/components/tab-bar'
import type { PortfolioTab } from '@/lib/polymarket/types'

type PortfolioTabShellProps = {
  activeTab: PortfolioTab
  onTabChange: (tab: PortfolioTab) => void
  toolbar?: ReactNode
  toolbarLayout?: 'spread' | 'scroll'
  children: ReactNode
}

export function PortfolioTabShell({
  activeTab,
  onTabChange,
  toolbar,
  toolbarLayout = 'spread',
  children,
}: PortfolioTabShellProps) {
  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:gap-2'>
        <div className='w-full overflow-x-auto scrollbar-none lg:w-auto lg:shrink-0'>
          <TabBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
        {toolbar ? (
          <PortfolioToolbarScroll
            layout={toolbarLayout}
            className='lg:min-w-0 lg:flex-1'
          >
            {toolbar}
          </PortfolioToolbarScroll>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  )
}
