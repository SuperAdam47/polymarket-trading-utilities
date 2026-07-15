import { useMemo, useState } from 'react'
import { ClosedPositionsTableHeader } from '@/features/polymarket/components/sort-column-header'
import { MarketTitleTooltip } from '@/features/polymarket/components/market-title-tooltip'
import { useClosedPositions } from '@/features/polymarket/hooks/use-polymarket-data'
import {
  formatCents,
  formatShares,
  formatUsd,
  formatUsdSigned,
} from '@/lib/polymarket/format'
import type { ClosedPosition } from '@/lib/polymarket/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

function WonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className={className}
    >
      <path
        d='M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.843,5.708l-4.25,5.5c-.136,.176-.343,.283-.565,.291-.01,0-.019,0-.028,0-.212,0-.415-.09-.558-.248l-2.25-2.5c-.277-.308-.252-.782,.056-1.06,.309-.276,.781-.252,1.06,.056l1.648,1.832,3.701-4.789c.253-.328,.725-.388,1.052-.135,.328,.253,.388,.724,.135,1.052Z'
        fill='currentColor'
      />
    </svg>
  )
}

function LostIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className={className}
    >
      <path
        d='M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.53,10.03c.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22L9,10.061l-2.47,2.47c-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22c-.293-.293-.293-.768,0-1.061L8.439,9,5.97,6.53c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0L9,7.939l2.47-2.47c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061L9.561,9l2.469,2.47Z'
        fill='currentColor'
      />
    </svg>
  )
}

function closedPositionMetrics(position: ClosedPosition) {
  const costBasis = position.totalBought * position.avgPrice
  const finalValue = costBasis + position.realizedPnl
  const pnlPercent = costBasis > 0 ? (position.realizedPnl / costBasis) * 100 : 0
  const isWon = position.realizedPnl >= 0

  return { costBasis, finalValue, pnlPercent, isWon }
}

function formatClosedPositionLine(position: ClosedPosition) {
  return `${formatShares(position.totalBought)} ${position.outcome} at ${formatCents(position.avgPrice)}`
}

function ResultBadge({ isWon, compact }: { isWon: boolean; compact?: boolean }) {
  return (
    <div className='flex items-center gap-1'>
      {isWon ? (
        <WonIcon className={cn('text-pm-green', compact && 'size-3')} />
      ) : (
        <LostIcon className={cn('text-pm-red', compact && 'size-3')} />
      )}
      <span
        className={cn(
          'font-medium',
          compact ? 'text-xs' : 'text-sm',
          isWon ? 'text-pm-green' : 'text-pm-red'
        )}
      >
        {isWon ? 'Won' : 'Lost'}
      </span>
    </div>
  )
}

function MarketIcon({ icon, size }: { icon?: string; size: 44 | 48 }) {
  const className = size === 48 ? 'size-12' : 'size-11'

  if (icon) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden rounded-sm', className)}>
        <img src={icon} alt='' className='absolute inset-0 size-full object-cover' />
      </div>
    )
  }

  return <div className={cn('shrink-0 rounded-sm bg-secondary', className)} />
}

function ValueColumn({
  finalValue,
  realizedPnl,
  pnlPercent,
  isWon,
  align = 'start',
}: {
  finalValue: number
  realizedPnl: number
  pnlPercent: number
  isWon: boolean
  align?: 'start' | 'end'
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center',
        align === 'end' ? 'items-end text-right' : 'items-start text-left'
      )}
    >
      <span className='text-[14px] leading-[21px] font-medium tracking-[0.15px]'>
        {formatUsd(finalValue)}
      </span>
      <span
        className={cn(
          'text-[12px] leading-[18px] tracking-[0.15px] whitespace-nowrap',
          isWon ? 'text-pm-green' : 'text-pm-red'
        )}
      >
        <span className='font-medium'>
          {formatUsdSigned(realizedPnl)} ({Math.abs(pnlPercent).toFixed(2)}%)
        </span>
      </span>
    </div>
  )
}

function ClosedPositionRowDesktop({
  position,
  alternate,
}: {
  position: ClosedPosition
  alternate: boolean
}) {
  const { costBasis, finalValue, pnlPercent, isWon } =
    closedPositionMetrics(position)

  return (
    <div
      className={cn(
        'hidden px-4 py-3 lg:flex lg:min-h-[64px] lg:items-center',
        alternate && 'pm-closed-row-bg rounded-lg'
      )}
    >
      <div className='flex w-full items-center gap-2'>
        <div className='flex items-center justify-start' style={{ flex: '2 1 0%' }}>
          <ResultBadge isWon={isWon} />
        </div>

        <div className='flex min-w-0 items-center justify-start' style={{ flex: '13.5 1 0%' }}>
          <div className='flex flex-row items-center gap-3'>
            <MarketIcon icon={position.icon} size={44} />
            <div className='flex min-w-0 flex-col gap-[2px]'>
              <MarketTitleTooltip
                title={position.title}
                className='line-clamp-1 cursor-pointer overflow-hidden text-[13px] leading-[21px] font-medium break-all text-foreground hover:underline'
              />
              <div className='flex flex-row items-center gap-1'>
                <span className='text-[12px] leading-[18px] font-medium tracking-[0.15px] text-muted-foreground'>
                  {formatClosedPositionLine(position)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-start' style={{ flex: '3 1 0%' }}>
          <p className='text-sm font-medium'>{formatUsd(costBasis)}</p>
        </div>

        <div className='flex items-center justify-end' style={{ flex: '4 1 0%' }}>
          <ValueColumn
            finalValue={finalValue}
            realizedPnl={position.realizedPnl}
            pnlPercent={pnlPercent}
            isWon={isWon}
            align='end'
          />
        </div>

        <div className='flex items-center justify-end' style={{ flex: '1.5 1 0%' }}>
          <button
            type='button'
            className='pm-closed-share-btn'
            aria-label='Share position'
          >
            <ShareIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function ClosedPositionRowMobile({
  position,
  alternate,
}: {
  position: ClosedPosition
  alternate: boolean
}) {
  const { finalValue, pnlPercent, isWon } = closedPositionMetrics(position)

  return (
    <div className={cn('px-4 py-3 lg:hidden', alternate && 'pm-closed-row-bg rounded-lg')}>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <MarketIcon icon={position.icon} size={48} />
          <div className='min-w-0 flex-1'>
            <p className='line-clamp-2 text-sm font-medium text-foreground hover:underline'>
              {position.title}
            </p>
            <div className='mt-1 flex items-center gap-2'>
              <ResultBadge isWon={isWon} compact />
              <span className='text-xs text-muted-foreground'>
                {formatClosedPositionLine(position)}
              </span>
            </div>
          </div>
        </div>

        <div className='my-auto flex items-center justify-center'>
          <ValueColumn
            finalValue={finalValue}
            realizedPnl={position.realizedPnl}
            pnlPercent={pnlPercent}
            isWon={isWon}
            align='end'
          />
        </div>
      </div>
    </div>
  )
}

function ClosedPositionRow({
  position,
  index,
}: {
  position: ClosedPosition
  index: number
}) {
  const alternate = index % 2 === 0

  return (
    <>
      <ClosedPositionRowDesktop position={position} alternate={alternate} />
      <ClosedPositionRowMobile position={position} alternate={alternate} />
    </>
  )
}

export function ClosedPositionsTab({
  search = '',
  sortBy = 'CURRENT',
}: {
  search?: string
  sortBy?: 'CURRENT' | 'CASHPNL' | 'TITLE'
} = {}) {
  const { data: positions, isLoading } = useClosedPositions()
  const [visibleCount, setVisibleCount] = useState(20)

  const sorted = useMemo(() => {
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
      const metricsA = closedPositionMetrics(a)
      const metricsB = closedPositionMetrics(b)

      switch (sortBy) {
        case 'TITLE':
          return a.title.localeCompare(b.title)
        case 'CASHPNL':
          return b.realizedPnl - a.realizedPnl
        default:
          return metricsB.finalValue - metricsA.finalValue
      }
    })

    return result
  }, [positions, search, sortBy])

  const visible = sorted.slice(0, visibleCount)

  return (
    <div className='relative flex flex-col'>
      <div className='relative bg-background'>
        <ClosedPositionsTableHeader />
        <div className='w-full'>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='px-4 py-3'>
                <Skeleton className='h-16 w-full bg-white/5' />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              No closed positions found.
            </div>
          ) : (
            visible.map((position, index) => (
              <ClosedPositionRow
                key={`${position.asset}-${position.timestamp}`}
                position={position}
                index={index}
              />
            ))
          )}
        </div>

        {sorted.length > visibleCount ? (
          <div className='flex w-full justify-center py-4'>
            <button
              type='button'
              onClick={() => setVisibleCount((count) => count + 20)}
              className='pm-show-more-btn'
            >
              Show more
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
