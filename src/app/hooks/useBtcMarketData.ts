import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_MARKET_SELECTION,
  fetchCurrentMarket,
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

  const marketSlugRef = useRef<string | null>(null)

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
  }, [])

  const loadMarket = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const m = await fetchCurrentMarket(selection)
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

      if (marketSlugRef.current !== m.slug) {
        marketSlugRef.current = m.slug
        setMarket(m)
        setTrades([])

        const [upSnap, downSnap] = await Promise.all([
          fetchBookSnapshot(m.upTokenId),
          fetchBookSnapshot(m.downTokenId),
        ])
        setUpBook(upSnap)
        setDownBook(downSnap)
      } else {
        setMarket(m)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load market')
    } finally {
      setLoading(false)
    }
  }, [selection])

  useEffect(() => {
    loadMarket()
    const refresh = setInterval(loadMarket, 15_000)
    const rotate = setInterval(() => {
      const delay = msUntilNextWindow(selection.interval) + 2000
      setTimeout(loadMarket, delay)
    }, 30_000)
    return () => {
      clearInterval(refresh)
      clearInterval(rotate)
    }
  }, [selection, loadMarket])

  useEffect(() => {
    if (!market) return

    const ws = new MarketWsClient()
    ws.setTokenOutcomes(market.upTokenId, market.downTokenId)
    ws.setHandlers({
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onBook: ({ assetId, bids, asks }) => {
        const snap = snapshotFromBook(bids, asks)
        if (assetId === market.upTokenId) setUpBook(snap)
        if (assetId === market.downTokenId) setDownBook(snap)
      },
      onPriceChange: ({ assetId, price, size, side }) => {
        if (assetId === market.upTokenId) {
          setUpBook((prev) => (prev ? applyPriceChange(prev, price, size, side) : prev))
        }
        if (assetId === market.downTokenId) {
          setDownBook((prev) => (prev ? applyPriceChange(prev, price, size, side) : prev))
        }
      },
      onTrade: (trade) => {
        setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES))
        if (trade.assetId === market.upTokenId) {
          setUpBook((prev) =>
            prev ? { ...prev, lastPrice: trade.price } : prev
          )
        }
        if (trade.assetId === market.downTokenId) {
          setDownBook((prev) =>
            prev ? { ...prev, lastPrice: trade.price } : prev
          )
        }
      },
    })

    ws.connect([market.upTokenId, market.downTokenId])
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
    refresh: loadMarket,
  }
}
