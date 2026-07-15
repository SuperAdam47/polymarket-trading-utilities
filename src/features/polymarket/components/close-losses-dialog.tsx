import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getLossClosedPositions,
  lossPositionCostBasis,
} from '@/features/polymarket/lib/loss-positions'
import { MarketTitleTooltip } from '@/features/polymarket/components/market-title-tooltip'
import {
  useActivity,
  useClosedPositions,
} from '@/features/polymarket/hooks/use-polymarket-data'
import { formatUsd } from '@/lib/polymarket/format'
import type { ClosedPosition } from '@/lib/polymarket/types'
import { cn } from '@/lib/utils'

function ModalCloseIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
    >
      <line
        x1='14'
        y1='4'
        x2='4'
        y2='14'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='4'
        y1='4'
        x2='14'
        y2='14'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function formatTradedAmount(value: number): string {
  const decimals =
    Math.abs(value - Math.round(value)) < 0.005 ? 0 : 2
  return formatUsd(value, decimals)
}

function LossPositionRow({ position }: { position: ClosedPosition }) {
  const eventSlug = position.eventSlug ?? position.slug
  const href = `https://polymarket.com/event/${eventSlug}/${position.slug}`
  const traded = lossPositionCostBasis(position)

  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className='block no-underline'
    >
      <div className='flex items-start gap-3 rounded-lg p-3 hover:bg-white/[0.04]'>
        <div className='relative size-10 shrink-0 overflow-hidden rounded-sm'>
          {position.icon ? (
            <img
              src={position.icon}
              alt=''
              className='size-full object-cover'
              loading='lazy'
            />
          ) : (
            <div className='size-full bg-white/10' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <MarketTitleTooltip
            as='h3'
            title={position.title}
            className='mb-1 line-clamp-2 text-sm leading-tight font-medium text-foreground'
          />
          <p className='flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground'>
            <span>Traded {formatTradedAmount(traded)}</span>
          </p>
        </div>
      </div>
    </a>
  )
}

function LossPositionsList({
  positions,
  isLoading,
}: {
  positions: ClosedPosition[]
  isLoading: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fadeTop, setFadeTop] = useState(false)
  const [fadeBottom, setFadeBottom] = useState(false)

  const updateFade = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setFadeTop(el.scrollTop > 1)
    setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])

  useEffect(() => {
    updateFade()
  }, [positions, isLoading, updateFade])

  if (isLoading) {
    return (
      <div className='space-y-2 px-6 py-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-[72px] w-full rounded-lg bg-white/5' />
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className='px-6 py-8 text-center text-sm text-muted-foreground'>
        No unresolved losses to close.
      </div>
    )
  }

  return (
    <div className='relative -mx-6'>
      <div
        className={cn(
          'pointer-events-none absolute top-0 right-0 left-0 z-[2] h-12 bg-gradient-to-b from-background to-transparent transition-opacity duration-200',
          fadeTop ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        ref={scrollRef}
        onScroll={updateFade}
        className='max-h-[45vh] overflow-y-auto px-6 no-scrollbar'
      >
        {positions.map((position) => (
          <LossPositionRow
            key={`${position.conditionId}:${position.timestamp}`}
            position={position}
          />
        ))}
      </div>
      <div
        className={cn(
          'pointer-events-none absolute right-0 bottom-0 left-0 z-[2] h-12 bg-gradient-to-t from-background to-transparent transition-opacity duration-200',
          fadeBottom ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}

type CloseLossesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CloseLossesDialog({
  open,
  onOpenChange,
}: CloseLossesDialogProps) {
  const { data: activities, isLoading: activityLoading } = useActivity({
    limit: 100,
  })
  const { data: closedPositions, isLoading: closedLoading } =
    useClosedPositions()

  const isLoading = activityLoading || closedLoading

  const lossPositions = getLossClosedPositions(
    closedPositions ?? [],
    activities ?? []
  )

  const handleCloseAll = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='z-[250] w-full min-w-0 max-w-[27rem] gap-4 overflow-hidden rounded-3xl border p-6 shadow-lg sm:max-w-[27rem]'
      >
        <div className='flex items-center'>
          <DialogTitle className='text-xl font-semibold'>
            Polymarkets Lost
          </DialogTitle>
          <DialogClose asChild>
            <button
              type='button'
              className='ml-auto shrink-0 cursor-pointer rounded-sm p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground'
              aria-label='Close'
            >
              <ModalCloseIcon />
            </button>
          </DialogClose>
        </div>

        <DialogDescription className='-mt-1 text-sm font-medium text-muted-foreground'>
          You can close out these resolved positions to realize the loss.
        </DialogDescription>

        <LossPositionsList positions={lossPositions} isLoading={isLoading} />

        <div className='flex w-full items-center gap-2 [&>*]:h-11 [&>*]:flex-1'>
          <button
            type='button'
            disabled={isLoading || lossPositions.length === 0}
            onClick={handleCloseAll}
            className='inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-button-primary-bg text-sm font-semibold text-button-primary-text transition duration-150 hover:bg-button-primary-bg-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'
          >
            {isLoading
              ? 'Loading…'
              : `Close ${lossPositions.length} Position${lossPositions.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
