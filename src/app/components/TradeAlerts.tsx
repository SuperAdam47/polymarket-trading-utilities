import { cn } from '@/lib/utils'
import type { TradeEvent } from '@/lib/polymarket/market-ws'

interface TradeAlertsProps {
  trades: TradeEvent[]
  whaleThreshold: number
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatTradeUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function OutcomeLabel({ outcome }: { outcome: TradeEvent['outcome'] }) {
  if (outcome === 'UP') {
    return (
      <span className="shrink-0 font-extrabold tracking-wide text-lime-200">
        ▲ UP
      </span>
    )
  }
  if (outcome === 'DOWN') {
    return (
      <span className="shrink-0 font-extrabold tracking-wide text-amber-200">
        ▼ DOWN
      </span>
    )
  }
  return <span className="shrink-0">{outcome ?? 'BTC'}</span>
}

export function TradeAlerts({ trades, whaleThreshold }: TradeAlertsProps) {
  return (
    <section className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="shrink-0 border-b border-border px-3 py-1.5">
        <span className="text-sm font-semibold">Live Trades</span>
      </header>

      <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden font-mono text-[13px] font-bold leading-none">
        {trades.length === 0 ? (
          <p className="p-3 text-xs font-normal text-muted-foreground">Waiting…</p>
        ) : (
          trades.map((trade) => {
            const isWhale = trade.usdValue >= whaleThreshold
            const fillPanel = trades.length > 1

            return (
              <div
                key={trade.id}
                className={cn(
                  'w-full min-w-0',
                  fillPanel ? 'min-h-7 flex-1' : 'h-7 shrink-0',
                  trade.side === 'BUY'
                    ? isWhale
                      ? 'bg-violet-600'
                      : 'bg-emerald-600'
                    : isWhale
                      ? 'bg-fuchsia-700'
                      : 'bg-red-600'
                )}
              >
                <div className="flex h-full w-full min-w-0 items-center justify-between gap-2 px-3 text-white">
                  <div className="flex min-w-0 items-center gap-2">
                    {isWhale && <span className="shrink-0">*</span>}
                    <span className="w-9 shrink-0">{trade.side}</span>
                    <OutcomeLabel outcome={trade.outcome} />
                    <span className="shrink-0 tabular-nums">
                      {formatTime(trade.timestamp)}
                    </span>
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {formatTradeUsd(trade.usdValue)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
