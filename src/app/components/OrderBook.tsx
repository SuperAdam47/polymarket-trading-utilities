import { cn } from '@/lib/utils'
import {
  formatCents,
  formatShares,
  formatUsd,
  getBarTotal,
  getVisibleBookLevels,
  type BookLevel,
  type OrderBookSnapshot,
} from '@/lib/polymarket/orderbook'
import type { OutcomeSide } from '../hooks/useBtcMarketData'

interface OrderBookProps {
  book: OrderBookSnapshot | null
  outcome: OutcomeSide
  onOutcomeChange: (outcome: OutcomeSide) => void
  loading?: boolean
}

function DepthRow({
  level,
  side,
  barTotal,
  label,
}: {
  level: BookLevel
  side: 'ask' | 'bid'
  barTotal: number
  label?: string
}) {
  const isAsk = side === 'ask'
  const barPct = Math.max(2, (level.total / barTotal) * 98)

  return (
    <div
      className={cn(
        'relative grid h-8 w-full grid-cols-[1fr_72px_80px_80px] items-center',
        isAsk ? 'hover:bg-red-500/10' : 'hover:bg-green-500/10'
      )}
    >
      <div className="relative h-full">
        <div
          className={cn(
            'absolute inset-y-0 left-0 opacity-20',
            isAsk ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${barPct}%` }}
        />
        {label && (
          <span
            className={cn(
              'absolute top-1/2 left-1.5 -translate-y-1/2 rounded px-1 py-px text-[9px] font-semibold text-white uppercase',
              isAsk ? 'bg-red-500' : 'bg-green-500'
            )}
          >
            {label}
          </span>
        )}
      </div>
      <p
        className={cn(
          'text-center text-sm font-semibold tabular-nums',
          isAsk ? 'text-red-500' : 'text-green-500'
        )}
      >
        {formatCents(level.price)}
      </p>
      <p className="text-center text-xs tabular-nums text-foreground/90">
        {formatShares(level.size)}
      </p>
      <p className="text-center text-xs tabular-nums text-foreground/90">
        {formatUsd(level.total)}
      </p>
    </div>
  )
}

function ColumnHeader({ outcome }: { outcome: OutcomeSide }) {
  return (
    <div className="grid h-7 shrink-0 grid-cols-[1fr_72px_80px_80px] items-center border-b border-border bg-card/80 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
      <span className="pl-2">{outcome === 'up' ? 'Trade Up' : 'Trade Down'}</span>
      <span className="text-center">Price</span>
      <span className="text-center">Shares</span>
      <span className="text-center">Total</span>
    </div>
  )
}

export function OrderBook({
  book,
  outcome,
  onOutcomeChange,
  loading,
}: OrderBookProps) {
  const { asks, bids } = book ? getVisibleBookLevels(book) : { asks: [], bids: [] }
  const askBarTotal = getBarTotal(asks)
  const bidBarTotal = getBarTotal(bids)

  return (
    <section className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Order Book</span>
          <div className="flex gap-2">
            {(['up', 'down'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => onOutcomeChange(side)}
                className={cn(
                  'cursor-pointer text-xs font-semibold transition-colors',
                  outcome === side
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                {side === 'up' ? 'Trade Up' : 'Trade Down'}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {book ? `${formatUsd(book.totalBidValue + book.totalAskValue)} Vol.` : '$0 Vol.'}
        </span>
      </div>

      <ColumnHeader outcome={outcome} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loading && !book ? (
          <p className="p-3 text-xs text-muted-foreground">Loading…</p>
        ) : !book ? (
          <p className="p-3 text-xs text-muted-foreground">No data</p>
        ) : (
          <>
            <div className="flex flex-col justify-end">
              {asks.map((level, i) => (
                <DepthRow
                  key={`ask-${level.price}`}
                  level={level}
                  side="ask"
                  barTotal={askBarTotal}
                  label={i === asks.length - 1 ? 'Asks' : undefined}
                />
              ))}
            </div>

            <div className="grid h-8 shrink-0 grid-cols-[1fr_72px_80px_80px] items-center border-y border-border bg-background/60">
              <p className="pl-2 text-xs font-semibold text-muted-foreground">
                Last: {book.lastPrice != null ? formatCents(book.lastPrice) : '—'}
              </p>
              <p className="text-center text-xs font-semibold text-muted-foreground">
                Spread: {book.spread != null ? formatCents(book.spread) : '—'}
              </p>
              <span />
              <span />
            </div>

            <div>
              {bids.map((level, i) => (
                <DepthRow
                  key={`bid-${level.price}`}
                  level={level}
                  side="bid"
                  barTotal={bidBarTotal}
                  label={i === 0 ? 'Bids' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
