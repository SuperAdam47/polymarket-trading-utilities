import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_MARKET_SELECTION,
  fetchCurrentMarket,
  fetchCurrentMarketWithRetry,
  getWindowTimestamp,
  msUntilNextWindow,
  selectionKey,
  type CryptoUpDownMarket,
  type MarketSelection,
} from '@/lib/polymarket/btc-market'
import { MarketWsClient, type TradeEvent } from '@/lib/polymarket/market-ws'
import {
  applyPriceChange,
  snapshotFromBook,
  type OrderBookSnapshot,
} from '@/lib/polymarket/orderbook'

export type OutcomeSide = 'up' | 'down'

const CLOB_API = 'https://clob.polymarket.com'
const MAX_TRADES = 15
const WHALE_THRESHOLD_USD = 500

async function fetchBookSnapshot(tokenId: string): Promise<OrderBookSnapshot> {
  const res = await fetch(`${CLOB_API}/book?token_id=${tokenId}`)
  if (!res.ok) throw new Error('Failed to fetch orderbook')
  const data = await res.json()
  return snapshotFromBook(data.bids ?? [], data.asks ?? [])
}

function applyMarketSnapshot(
  m: CryptoUpDownMarket,
  marketSlugRef: { current: string | null },
  setters: {
    setMarket: (m: CryptoUpDownMarket) => void
    setTrades: (t: TradeEvent[]) => void
  }
): boolean {
  const slugChanged = marketSlugRef.current !== m.slug
  marketSlugRef.current = m.slug
  setters.setMarket(m)
  if (slugChanged) setters.setTrades([])
  return slugChanged
}

export function useBtcMarketData() {
  const [selection, setSelection] = useState<MarketSelection>(
    DEFAULT_MARKET_SELECTION
  )
  const [market, setMarket] = useState<CryptoUpDownMarket | null>(null)
  const [outcome, setOutcome] = useState<OutcomeSide>('up')
  const [upBook, setUpBook] = useState<OrderBookSnapshot | null>(null)
  const [downBook, setDownBook] = useState<OrderBookSnapshot | null>(null)
  const [trades, setTrades] = useState<TradeEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)

  const marketSlugRef = useRef<string | null>(null)
  const windowTsRef = useRef(getWindowTimestamp(selection.interval))
  const loadMarketRef = useRef<(() => Promise<void>) | null>(null)

  const selectMarket = useCallback((next: MarketSelection) => {
    setSelection((prev) => {
      if (selectionKey(prev) === selectionKey(next)) return prev
      return next
    })
    setMarket(null)
    setUpBook(null)
    setDownBook(null)
    setTrades([])
    setConnected(false)
    setError(null)
    marketSlugRef.current = null
    windowTsRef.current = getWindowTimestamp(next.interval)
  }, [])

  const loadMarket = useCallback(
    async (opts?: { retry?: boolean }) => {
      setLoading(true)
      setError(null)
      try {
        const m = opts?.retry
          ? await fetchCurrentMarketWithRetry(selection)
          : await fetchCurrentMarket(selection)

        if (!m) {
          setError(
            `No active ${selection.asset.toUpperCase()} ${selection.interval}m market found`
          )
          setMarket(null)
          setUpBook(null)
          setDownBook(null)
          setTrades([])
          marketSlugRef.current = null
          return
        }

        const slugChanged = applyMarketSnapshot(m, marketSlugRef, {
          setMarket,
          setTrades,
        })

        if (slugChanged) {
          const [upSnap, downSnap] = await Promise.all([
            fetchBookSnapshot(m.upTokenId),
            fetchBookSnapshot(m.downTokenId),
          ])
          setUpBook(upSnap)
          setDownBook(downSnap)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load market')
      } finally {
        setLoading(false)
      }
    },
    [selection]
  )

  loadMarketRef.current = () => loadMarket()

  useEffect(() => {
    loadMarket()
    const refresh = setInterval(() => loadMarket(), 15_000)
    return () => clearInterval(refresh)
  }, [loadMarket])

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleWindowRotation = () => {
      const delay = msUntilNextWindow(selection.interval) + 1500
      timeoutId = setTimeout(async () => {
        if (cancelled) return

        marketSlugRef.current = null
        setTrades([])
        setConnected(false)
        windowTsRef.current = getWindowTimestamp(selection.interval)

        await loadMarket({ retry: true })

        if (!cancelled) scheduleWindowRotation()
      }, delay)
    }

    scheduleWindowRotation()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [selection.interval, loadMarket])

  useEffect(() => {
    const tick = () => {
      const remaining = msUntilNextWindow(selection.interval)
      setTimeRemainingMs(remaining)

      const currentWindowTs = getWindowTimestamp(selection.interval)
      if (
        currentWindowTs !== windowTsRef.current &&
        remaining <= 1000 &&
        loadMarketRef.current
      ) {
        windowTsRef.current = currentWindowTs
        marketSlugRef.current = null
        setTrades([])
        void loadMarketRef.current?.()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [selection.interval])

  useEffect(() => {
    if (!market) return

    const upTokenId = market.upTokenId
    const downTokenId = market.downTokenId
    const ws = new MarketWsClient()

    ws.setTokenOutcomes(upTokenId, downTokenId)
    ws.setHandlers({
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onBook: ({ assetId, bids, asks }) => {
        const snap = snapshotFromBook(bids, asks)
        if (assetId === upTokenId) setUpBook(snap)
        if (assetId === downTokenId) setDownBook(snap)
      },
      onPriceChange: ({ assetId, price, size, side }) => {
        if (assetId === upTokenId) {
          setUpBook((prev) => (prev ? applyPriceChange(prev, price, size, side) : prev))
        }
        if (assetId === downTokenId) {
          setDownBook((prev) => (prev ? applyPriceChange(prev, price, size, side) : prev))
        }
      },
      onTrade: (trade) => {
        if (trade.assetId !== upTokenId && trade.assetId !== downTokenId) return
        setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES))
        if (trade.assetId === upTokenId) {
          setUpBook((prev) =>
            prev ? { ...prev, lastPrice: trade.price } : prev
          )
        }
        if (trade.assetId === downTokenId) {
          setDownBook((prev) =>
            prev ? { ...prev, lastPrice: trade.price } : prev
          )
        }
      },
    })

    ws.connect([upTokenId, downTokenId])
    return () => ws.disconnect()
  }, [market?.slug, market?.upTokenId, market?.downTokenId])

  const activeBook = outcome === 'up' ? upBook : downBook

  return {
    market,
    selection,
    selectMarket,
    outcome,
    setOutcome,
    book: activeBook,
    trades,
    connected,
    loading,
    error,
    whaleThreshold: WHALE_THRESHOLD_USD,
    timeRemainingMs,
    refresh: () => loadMarket(),
  }
}
