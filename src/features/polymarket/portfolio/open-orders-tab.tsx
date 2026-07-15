import { PortfolioTabShell } from '@/features/polymarket/components/portfolio-tab-shell'
import { PortfolioSearchInput } from '@/features/polymarket/components/portfolio-toolbar'
import type { PortfolioTab } from '@/lib/polymarket/types'

type OpenOrdersTabProps = {
  activeTab: PortfolioTab
  onTabChange: (tab: PortfolioTab) => void
}

export function OpenOrdersTab({ activeTab, onTabChange }: OpenOrdersTabProps) {
  return (
    <PortfolioTabShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      toolbar={
        <>
          <PortfolioSearchInput
            value=''
            onChange={() => undefined}
            readOnly
          />
          <button
            type='button'
            disabled
            className='pm-sort-trigger pm-sort-trigger-disabled'
          >
            <span className='shrink-0 whitespace-nowrap px-1 text-left'>Market</span>
          </button>
        </>
      }
    >
      <div className='relative flex flex-col'>
        <div className='relative bg-background'>
          <div className='sticky top-0 z-[1] hidden items-center gap-2 bg-background px-4 py-4 lg:flex'>
            <div className='flex-1'>
              <span className='text-[11px] leading-[15px] font-medium tracking-wider uppercase text-muted-foreground'>
                Market
              </span>
            </div>
            <div style={{ flex: '1 1 0%' }}>
              <span className='text-[11px] leading-[15px] font-medium tracking-wider uppercase text-muted-foreground'>
                Filled
              </span>
            </div>
            <div style={{ flex: '1 1 0%' }}>
              <span className='text-[11px] leading-[15px] font-medium tracking-wider uppercase text-muted-foreground'>
                Total
              </span>
            </div>
            <div style={{ flex: '1 1 0%' }}>
              <span className='text-[11px] leading-[15px] font-medium tracking-wider uppercase text-muted-foreground'>
                Expiration
              </span>
            </div>
          </div>
          <div className='px-4 py-16 text-center text-muted-foreground'>
            No open orders found.
          </div>
        </div>
      </div>
    </PortfolioTabShell>
  )
}
