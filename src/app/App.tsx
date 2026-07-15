import { OrderBook } from './components/OrderBook'
import { TradeAlerts } from './components/TradeAlerts'
import { useBtcMarketData } from './hooks/useBtcMarketData'
import {
  MARKET_OPTIONS,
  selectionKey,
  parseSelectionKey,
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
            className="w-full max-w-md cursor-pointer truncate rounded-md border border-border bg-card px-2 py-1 text-sm font-semibold outline-none focus:ring-1 focus:ring-ring"
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
          {market && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {market.question}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              connected ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-green-500' : 'bg-muted-foreground'
              }`}
            />
            {connected ? 'Live' : loading ? 'Loading…' : '…'}
          </span>
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

      <main className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-2 [&>*]:h-full [&>*]:min-h-0 [&>*]:w-full [&>*]:min-w-0">
        <OrderBook
          book={book}
          outcome={outcome}
          onOutcomeChange={setOutcome}
          loading={loading}
        />
        <TradeAlerts trades={trades} whaleThreshold={whaleThreshold} />
      </main>
    </div>
  )
}
