import { OrderBook } from './components/OrderBook'
import { TradeAlerts } from './components/TradeAlerts'
import { useBtcMarketData } from './hooks/useBtcMarketData'
import {
  MARKET_OPTIONS,
  selectionKey,
  parseSelectionKey,
  formatTimeRemaining,
} from '@/lib/polymarket/btc-market'

export function App() {
  const {
    market,
    selection,
    selectMarket,
    outcome,
    setOutcome,
    book,
    trades,
    connected,
    loading,
    error,
    whaleThreshold,
    timeRemainingMs,
    refresh,
  } = useBtcMarketData()

  return (
    <div className="dark flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <select
            value={selectionKey(selection)}
            onChange={(e) => {
              const next = parseSelectionKey(e.target.value)
              if (next) selectMarket(next)
            }}
            className="w-full cursor-pointer truncate rounded-md border border-border bg-card px-2 py-1 text-sm font-semibold outline-none focus:ring-1 focus:ring-ring"
          >
            {MARKET_OPTIONS.map((option) => (
              <option
                key={selectionKey(option.selection)}
                value={selectionKey(option.selection)}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {market?.question ?? '\u00A0'}
            </p>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-red-500">
              {formatTimeRemaining(timeRemainingMs)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {connected ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-500">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span>Live</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              {loading ? 'Loading…' : '…'}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            className="rounded border border-border px-2 py-0.5 text-[11px] font-medium hover:bg-accent"
          >
            ↻
          </button>
        </div>
      </header>

      {error && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {error}
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <div className="flex min-h-0 flex-1 flex-col">
          <OrderBook
            book={book}
            outcome={outcome}
            onOutcomeChange={setOutcome}
            loading={loading}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <TradeAlerts trades={trades} whaleThreshold={whaleThreshold} />
        </div>
      </main>
    </div>
  )
}
