import { Link } from '@tanstack/react-router'
import { pmPrimaryButtonMdClassName } from '@/features/polymarket/components/deposit-button-styles'
import {
  HeaderBellIcon,
  HeaderGiftIcon,
  HeaderSearchIcon,
} from '@/features/polymarket/components/header-icons'
import { PolymarketUserMenu } from '@/features/polymarket/layout/user-menu'
import { PolymarketLogo } from '@/features/polymarket/components/polymarket-logo'
import { CategoryNav } from '@/features/polymarket/layout/category-nav'
import { formatHeaderUsd } from '@/lib/polymarket/format'
import { usePortfolioSummary } from '@/features/polymarket/hooks/use-polymarket-data'
import { Skeleton } from '@/components/ui/skeleton'

function HeaderStat({
  label,
  value,
  isLoading,
}: {
  label: string
  value: string
  isLoading?: boolean
}) {
  return (
    <div className='pm-header-stat'>
      <div className='text-xs font-medium whitespace-nowrap text-muted-foreground'>
        {label}
      </div>
      {isLoading ? (
        <Skeleton className='mt-0.5 h-[18px] w-[4.5rem] bg-white/5' />
      ) : (
        <div className='text-[15px] font-semibold leading-[18px] text-pm-green'>
          {value}
        </div>
      )}
    </div>
  )
}

export function PolymarketHeader() {
  const { data, isLoading } = usePortfolioSummary()

  return (
    <nav
      aria-label='Main'
      className='sticky inset-x-0 top-0 z-30 box-border flex w-full flex-col overflow-visible bg-background'
    >
      <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-border' />

      <div className='relative z-[31] mx-auto flex w-full max-w-[1350px] items-center justify-between gap-4 px-4 pt-3 pb-1 md:min-h-[68px] md:pb-2 lg:px-6'>
        <div className='flex h-10 w-fit shrink-0 cursor-pointer items-center gap-1'>
          <Link to='/portfolio' search={{ tab: 'positions' }} aria-label='Polymarket Logo'>
            <PolymarketLogo className='h-[26px] w-auto cursor-pointer px-2.5' />
          </Link>
        </div>

        <div className='hidden w-full min-w-0 items-center gap-2 lg:flex'>
          <form className='relative w-full min-w-0 max-w-full p-0 lg:min-w-[400px] lg:max-w-[600px]'>
            <div className='relative'>
              <div className='absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground'>
                <HeaderSearchIcon />
              </div>
              <input
                id='search-input'
                type='text'
                autoComplete='off'
                placeholder='Search polymarkets...'
                readOnly
                className='pm-header-search'
              />
            </div>
          </form>
        </div>

        <div className='shrink min-w-0 md:shrink-0 md:min-w-fit'>
          <div className='ml-auto flex min-w-0 items-center gap-x-2'>
            <div className='flex min-w-0 items-center gap-x-2'>
              <div className='hidden items-center gap-x-1 md:flex'>
                <Link to='/portfolio' search={{ tab: 'positions' }}>
                  <HeaderStat
                    label='Portfolio'
                    value={formatHeaderUsd(data?.portfolioTotal ?? 0)}
                    isLoading={isLoading}
                  />
                </Link>
                <Link to='/portfolio' search={{ tab: 'positions' }}>
                  <HeaderStat
                    label='Cash'
                    value={formatHeaderUsd(data?.cashBalance ?? 0)}
                    isLoading={isLoading}
                  />
                </Link>
              </div>

              <button
                type='button'
                className={`${pmPrimaryButtonMdClassName} hidden md:inline-flex`}
              >
                Deposit
              </button>

              <Link to='/portfolio' search={{ tab: 'positions' }} className='pm-header-icon-btn' aria-label='Referrals'>
                <HeaderGiftIcon />
              </Link>

              <button
                type='button'
                aria-label='Notifications'
                className='pm-header-icon-btn'
              >
                <HeaderBellIcon />
                <span className='pm-header-bell-dot' aria-hidden='true' />
              </button>
            </div>

            <div className='flex items-center gap-x-2'>
              <div className='-ml-1 hidden h-5 w-px bg-border md:block' />

              <PolymarketUserMenu className='md:hidden' showChevron={false} />
              <PolymarketUserMenu className='hidden md:flex' />
            </div>
          </div>
        </div>
      </div>

      <CategoryNav />
    </nav>
  )
}
