import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { PortfolioSelect } from '@/features/polymarket/components/portfolio-select'
import { ProfilePositionsTableHeader } from '@/features/polymarket/components/sort-column-header'
import { usePositionsList } from '@/features/polymarket/portfolio/positions-tab'
import { ClosedPositionsTab } from '@/features/polymarket/portfolio/closed-positions-tab'
import {
  formatCents,
  formatPercent,
  formatShares,
  formatUsd,
  formatUsdSigned,
} from '@/lib/polymarket/format'
import type { Position } from '@/lib/polymarket/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PositionSubTab = 'active' | 'closed'

type SortOption = 'CURRENT' | 'CASHPNL' | 'TITLE'

const PROFILE_SORT_LABELS: Record<SortOption, string> = {
  CURRENT: 'Value',
  CASHPNL: 'P&L',
  TITLE: 'Market',
}

function ProfileSearchIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className='text-muted-foreground'
    >
      <path
        d='M15.75 15.75L11.6386 11.6386'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
      <path
        d='M7.75 13.25C10.7875 13.25 13.25 10.7875 13.25 7.75C13.25 4.7125 10.7875 2.25 7.75 2.25C4.7125 2.25 2.25 4.7125 2.25 7.75C2.25 10.7875 4.7125 13.25 7.75 13.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
    </svg>
  )
}

function ProfileSortIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      viewBox='0 0 12 12'
      aria-hidden='true'
    >
      <line
        x1='8.75'
        y1='11'
        x2='8.75'
        y2='4'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='6.25 8.75 8.75 11.25 11.25 8.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='1'
        y1='1.25'
        x2='11'
        y2='1.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='1'
        y1='4.75'
        x2='3.75'
        y2='4.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='1'
        y1='8.25'
        x2='3.75'
        y2='8.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function ProfileSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className='relative min-w-0 flex-1'>
      <div className='absolute top-1/2 left-3.5 -translate-y-1/2'>
        <ProfileSearchIcon />
      </div>
      <Input
        className='h-10 w-full border-border bg-transparent pl-10 text-sm ring-0 transition-[box-shadow] duration-200 focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-brand-500/70'
        placeholder={placeholder}
        aria-label='Search positions'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function ProfileSortSelect({
  value,
  onChange,
  className,
}: {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}) {
  return (
    <PortfolioSelect
      value={value}
      onChange={onChange}
      options={PROFILE_SORT_LABELS}
      icon={<ProfileSortIcon />}
      ariaLabel='Sort by'
      triggerVariant='outline'
      wrapperClassName={className}
    />
  )
}

function ProfileActiveClosedToggle({
  value,
  onChange,
}: {
  value: PositionSubTab
  onChange: (value: PositionSubTab) => void
}) {
  const options: { id: PositionSubTab; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'closed', label: 'Closed' },
  ]

  return (
    <div className='flex h-10 w-full shrink-0 items-center overflow-hidden rounded-md border md:w-fit md:flex-initial'>
      {options.map((option, index) => {
        const isActive = value === option.id

        return (
          <div key={option.id} className='flex h-full min-w-0 flex-1 md:flex-initial md:w-fit'>
            {index > 0 ? <div className='h-full w-px shrink-0 bg-border' /> : null}
            <div
              className={cn(
                'flex h-full w-full items-center justify-center transition-colors hover:bg-white/5 md:w-fit',
                isActive && 'bg-white/10'
              )}
            >
              <button
                type='button'
                onClick={() => onChange(option.id)}
                className={cn(
                  'inline-flex h-9 w-full cursor-pointer items-center justify-center px-4 text-sm font-semibold transition duration-150 active:scale-[0.97] md:w-fit',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {option.label}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProfilePositionsToolbar({
  subTab,
  onSubTabChange,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: {
  subTab: PositionSubTab
  onSubTabChange: (value: PositionSubTab) => void
  search: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}) {
  return (
    <div className='flex flex-col gap-2 py-2'>
      <div className='flex w-full flex-col gap-2 md:flex-row'>
        <div className='flex w-full items-center gap-2 md:w-auto'>
          <ProfileActiveClosedToggle value={subTab} onChange={onSubTabChange} />
          <ProfileSortSelect
            value={sortBy}
            onChange={onSortChange}
            className='md:hidden'
          />
        </div>
        <div className='flex w-full items-center gap-2 md:flex-1'>
          <ProfileSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder='Search positions'
          />
          <ProfileSortSelect
            value={sortBy}
            onChange={onSortChange}
            className='hidden md:block'
          />
        </div>
      </div>
    </div>
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

function ProfilePositionMarketCell({ position }: { position: Position }) {
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
        <h2 className='line-clamp-1 cursor-pointer text-[13px] leading-[21px] font-medium break-all text-foreground hover:underline'>
          {position.title}
        </h2>
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

function ProfilePositionRowDesktop({
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
          className='flex min-w-0 items-center justify-start'
          style={{ flex: '17.65 1 0%' }}
        >
          <ProfilePositionMarketCell position={position} />
        </div>
        <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
          <span className='text-sm font-normal text-muted-foreground'>
            {formatCents(position.avgPrice)}
          </span>
        </div>
        <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
          <span className='text-sm font-normal text-foreground'>
            {formatCents(position.curPrice)}
          </span>
        </div>
        <div className='flex items-center justify-end' style={{ flex: '4 1 0%' }}>
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
                {formatPercent(position.percentPnl)})
              </span>
            </span>
          </div>
        </div>
        <div
          className='flex min-w-[3rem] items-center justify-start'
          style={{ flex: '1.5 1 0%' }}
        />
      </div>
    </div>
  )
}

function ProfilePositionRowMobile({
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
        'px-4 py-3 lg:hidden',
        alternate && 'pm-position-row-alt rounded-lg'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
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
    </div>
  )
}

function ProfilePositionRow({
  position,
  index,
}: {
  position: Position
  index: number
}) {
  const alternate = index % 2 === 0

  return (
    <>
      <ProfilePositionRowDesktop position={position} alternate={alternate} />
      <ProfilePositionRowMobile position={position} alternate={alternate} />
    </>
  )
}

function ProfileActivePositionsList({
  list,
}: {
  list: ReturnType<typeof usePositionsList>
}) {
  return (
    <div className='relative bg-background'>
      <ProfilePositionsTableHeader />
      <div className='w-full'>
        {list.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='px-4 py-3'>
              <Skeleton className='h-16 w-full bg-white/5' />
            </div>
          ))
        ) : list.visible.length === 0 ? (
          <div className='my-4 flex h-full w-full items-center justify-center'>
            <span className='text-sm whitespace-nowrap text-muted-foreground'>
              No positions found
            </span>
          </div>
        ) : (
          list.visible.map((position, index) => (
            <ProfilePositionRow
              key={position.asset}
              position={position}
              index={index}
            />
          ))
        )}
      </div>
      {list.filtered.length > list.visibleCount ? (
        <div className='flex w-full justify-center py-4'>
          <button
            type='button'
            onClick={() => list.setVisibleCount((count) => count + 10)}
            className='pm-show-more-btn'
          >
            Show more positions
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ProfilePositionsSection() {
  const [subTab, setSubTab] = useState<PositionSubTab>('active')
  const activeList = usePositionsList()
  const [closedSearch, setClosedSearch] = useState('')
  const [closedSortBy, setClosedSortBy] = useState<SortOption>('CURRENT')

  return (
    <div className='flex flex-col'>
      <ProfilePositionsToolbar
        subTab={subTab}
        onSubTabChange={setSubTab}
        search={subTab === 'active' ? activeList.search : closedSearch}
        onSearchChange={
          subTab === 'active' ? activeList.setSearch : setClosedSearch
        }
        sortBy={subTab === 'active' ? activeList.sortBy : closedSortBy}
        onSortChange={
          subTab === 'active' ? activeList.setSortBy : setClosedSortBy
        }
      />
      {subTab === 'active' ? (
        <ProfileActivePositionsList list={activeList} />
      ) : (
        <ClosedPositionsTab search={closedSearch} sortBy={closedSortBy} />
      )}
    </div>
  )
}
