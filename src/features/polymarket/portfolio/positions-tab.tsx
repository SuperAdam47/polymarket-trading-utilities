import { useMemo, useState } from 'react'
import { PortfolioTabShell } from '@/features/polymarket/components/portfolio-tab-shell'
import { MarketTitleTooltip } from '@/features/polymarket/components/market-title-tooltip'
import {
  PortfolioSearchInput,
  PortfolioSortSelect,
} from '@/features/polymarket/components/portfolio-toolbar'
import { PositionsTableHeader } from '@/features/polymarket/components/sort-column-header'
import {
  formatCents,
  formatPercent,
  formatShares,
  formatUsd,
  formatUsdSigned,
} from '@/lib/polymarket/format'
import { useActivePositions } from '@/features/polymarket/hooks/use-polymarket-data'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PortfolioTab, Position } from '@/lib/polymarket/types'

type SortOption = 'CURRENT' | 'CASHPNL' | 'TITLE'

const SORT_LABELS: Record<SortOption, string> = {
  CURRENT: 'Current value',
  CASHPNL: 'P&L',
  TITLE: 'Market',
}

function ShareIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='14'
      height='14'
      viewBox='0 0 18 18'
      aria-hidden='true'
    >
      <path
        d='M15.25,11.75v1.5c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2v-1.5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='12.5 6.25 9 2.75 5.5 6.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='9'
        y1='2.75'
        x2='9'
        y2='10.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function PriceArrowIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='10'
      height='10'
      viewBox='0 0 12 12'
      aria-hidden='true'
      className='shrink-0 text-muted-foreground/50'
    >
      <line
        x1='1'
        y1='6'
        x2='10.75'
        y2='6'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='7.75 9.25 11 6 7.75 2.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function OutcomeBadge({ outcome, price }: { outcome: string; price: number }) {
  const isUp =
    outcome.toLowerCase() === 'up' || outcome.toLowerCase() === 'yes'
  const label = `${outcome} ${formatCents(price)}`

  return (
    <div
      className={cn(
        'inline-flex w-fit items-center rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-semibold',
        isUp
          ? 'bg-pm-green/15 text-pm-green'
          : 'bg-pm-red/15 text-pm-red'
      )}
    >
      {label}
    </div>
  )
}

function PositionMarketCell({ position }: { position: Position }) {
  return (
    <div className='flex min-w-0 flex-row items-center gap-3'>
      {position.icon ? (
        <div className='relative size-11 shrink-0 overflow-hidden rounded-sm'>
          <img
            src={position.icon}
            alt=''
            className='absolute inset-0 size-full object-cover'
          />
        </div>
      ) : (
        <div className='size-11 shrink-0 rounded-sm bg-secondary' />
      )}
      <div className='flex min-w-0 flex-col gap-[2px]'>
        <MarketTitleTooltip
          title={position.title}
          className='line-clamp-1 cursor-pointer text-[13px] leading-[21px] font-medium break-all text-foreground hover:underline'
        />
        <div className='flex flex-row items-center gap-1'>
          <OutcomeBadge outcome={position.outcome} price={position.avgPrice} />
          <span className='text-[12px] leading-[18px] font-medium tracking-[0.15px] text-muted-foreground'>
            {formatShares(position.size)} shares
          </span>
        </div>
      </div>
    </div>
  )
}

function PositionRowDesktop({
  position,
  alternate,
}: {
  position: Position
  alternate: boolean
}) {
  const pnlPositive = position.cashPnl >= 0

  return (
    <div
      className={cn(
        'hidden px-4 py-3 lg:flex lg:min-h-[64px] lg:items-center',
        alternate && 'pm-position-row-alt rounded-lg'
      )}
    >
      <div className='flex w-full items-center gap-2'>
        <div
          className='flex min-w-0 items-center justify-start gap-2'
          style={{ flex: '5 1 0%' }}
        >
          <PositionMarketCell position={position} />
        </div>
        <div className='flex items-center justify-start' style={{ flex: '2 1 0%' }}>
          <div className='flex flex-row items-center gap-1'>
            <span className='text-sm font-normal text-muted-foreground'>
              {formatCents(position.avgPrice)}
            </span>
            <PriceArrowIcon />
            <span className='text-sm font-normal text-foreground'>
              {formatCents(position.curPrice)}
            </span>
          </div>
        </div>
        <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
          <span className='text-sm font-normal text-muted-foreground'>
            {formatUsd(position.initialValue)}
          </span>
        </div>
        <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
          <span className='text-sm font-normal text-muted-foreground'>
            {formatUsd(position.size)}
          </span>
        </div>
        <div className='flex items-center justify-start' style={{ flex: '2 1 0%' }}>
          <div className='flex flex-col items-start justify-center text-left'>
            <span className='text-[14px] leading-[21px] font-medium tracking-[0.15px]'>
              {formatUsd(position.currentValue)}
            </span>
            <span
              className={cn(
                'text-[12px] leading-[18px] tracking-[0.15px] whitespace-nowrap',
                pnlPositive ? 'text-pm-green' : 'text-red-500'
              )}
            >
              <span className='font-medium'>
                {formatUsdSigned(position.cashPnl)} (
                {formatPercent(position.percentPnl)})
              </span>
            </span>
          </div>
        </div>
        <div className='flex w-[120px] shrink-0 items-center justify-end'>
          <div className='flex items-center gap-2'>
            <button type='button' disabled className='pm-sell-btn'>
              Sell
            </button>
            <button
              type='button'
              className='pm-icon-ghost-btn'
              aria-label='Share position'
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PositionRowMobile({
  position,
  alternate,
}: {
  position: Position
  alternate: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const pnlPositive = position.cashPnl >= 0

  return (
    <div
      className={cn(
        'px-4 py-3 lg:hidden',
        alternate && 'pm-position-row-alt rounded-lg'
      )}
    >
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle position details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          {position.icon ? (
            <div className='relative size-12 shrink-0 overflow-hidden rounded-sm'>
              <img
                src={position.icon}
                alt=''
                className='absolute inset-0 size-full object-cover'
              />
            </div>
          ) : (
            <div className='size-12 shrink-0 rounded-sm bg-secondary' />
          )}
          <div className='min-w-0 flex-1'>
            <p className='line-clamp-2 text-sm font-medium text-foreground hover:underline'>
              {position.title}
            </p>
            <div className='mt-1 flex items-center gap-2'>
              <OutcomeBadge outcome={position.outcome} price={position.avgPrice} />
              <span className='text-xs text-muted-foreground'>
                {formatShares(position.size)} shares
              </span>
            </div>
          </div>
        </div>
        <div className='my-auto flex items-center justify-center'>
          <div className='flex flex-col items-end justify-center text-right'>
            <span className='text-[14px] leading-[21px] font-medium tracking-[0.15px]'>
              {formatUsd(position.currentValue)}
            </span>
            <span
              className={cn(
                'text-[12px] leading-[18px] tracking-[0.15px] whitespace-nowrap',
                pnlPositive ? 'text-pm-green' : 'text-red-500'
              )}
            >
              <span className='font-medium'>
                {formatUsdSigned(position.cashPnl)} (
                {formatPercent(position.percentPnl, 1)})
              </span>
            </span>
          </div>
        </div>
      </div>
      {expanded ? (
        <div className='flex items-center justify-between pt-3 pb-1'>
          <div>
            <p className='flex items-center gap-2 text-[10px] text-muted-foreground'>
              <span>AVG</span>
              <span>•</span>
              <span>NOW</span>
            </p>
            <p className='flex items-center gap-1 text-xs font-medium'>
              <span className='text-foreground'>
                {formatCents(position.avgPrice)}
              </span>
              <PriceArrowIcon />
              <span>{formatCents(position.curPrice)}</span>
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button type='button' disabled className='pm-sell-btn !h-8 px-8'>
              Sell
            </button>
            <button
              type='button'
              className='pm-icon-ghost-btn border border-white/10'
              aria-label='Share position'
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PositionRow({
  position,
  index,
}: {
  position: Position
  index: number
}) {
  const alternate = index % 2 === 0
  return (
    <>
      <PositionRowDesktop position={position} alternate={alternate} />
      <PositionRowMobile position={position} alternate={alternate} />
    </>
  )
}

export function usePositionsList() {
  const { data: positions, isLoading } = useActivePositions()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('CURRENT')
  const [visibleCount, setVisibleCount] = useState(10)

  const filtered = useMemo(() => {
    if (!positions) return []
    let result = [...positions]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.outcome.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'CASHPNL':
          return b.cashPnl - a.cashPnl
        case 'TITLE':
          return a.title.localeCompare(b.title)
        default:
          return b.currentValue - a.currentValue
      }
    })
    return result
  }, [positions, search, sortBy])

  const visible = filtered.slice(0, visibleCount)

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    visible,
    filtered,
    visibleCount,
    setVisibleCount,
    isLoading,
  }
}

function PositionsListView({
  visible,
  filtered,
  visibleCount,
  setVisibleCount,
  isLoading,
}: ReturnType<typeof usePositionsList>) {
  return (
    <div className='relative flex flex-col'>
      <div className='relative bg-background'>
        <PositionsTableHeader />
        <div className='w-full'>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='px-4 py-3'>
                <Skeleton className='h-16 w-full bg-white/5' />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              No positions found.
            </div>
          ) : (
            visible.map((position, index) => (
              <PositionRow
                key={position.asset}
                position={position}
                index={index}
              />
            ))
          )}
        </div>
        {filtered.length > visibleCount ? (
          <div className='flex w-full justify-center py-4'>
            <button
              type='button'
              onClick={() => setVisibleCount((c) => c + 10)}
              className='pm-show-more-btn'
            >
              Show more positions
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function PositionsPanel() {
  const list = usePositionsList()

  return (
    <>
      <div className='mb-4 flex flex-wrap items-center justify-end gap-2 lg:hidden'>
        <PortfolioSearchInput
          value={list.search}
          onChange={list.setSearch}
          placeholder='Search'
        />
        <PortfolioSortSelect
          value={list.sortBy}
          onChange={list.setSortBy}
          options={SORT_LABELS}
        />
      </div>
      <PositionsListView {...list} />
    </>
  )
}

type PositionsTabProps = {
  activeTab: PortfolioTab
  onTabChange: (tab: PortfolioTab) => void
}

export function PositionsTab({ activeTab, onTabChange }: PositionsTabProps) {
  const list = usePositionsList()

  return (
    <PortfolioTabShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      toolbar={
        <>
          <PortfolioSearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder='Search'
          />
          <PortfolioSortSelect
            value={list.sortBy}
            onChange={list.setSortBy}
            options={SORT_LABELS}
          />
        </>
      }
    >
      <PositionsListView {...list} />
    </PortfolioTabShell>
  )
}
