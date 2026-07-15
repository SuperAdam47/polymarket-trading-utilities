export interface BookLevel {
  price: number
  size: number
  total: number
}

export interface OrderBookSnapshot {
  bids: BookLevel[]
  asks: BookLevel[]
  lastPrice: number | null
  spread: number | null
  totalBidValue: number
  totalAskValue: number
}

interface RawLevel {
  price: string
  size: string
}

function toNum(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function buildLevels(levels: RawLevel[]): BookLevel[] {
  return levels
    .map((l) => {
      const price = toNum(l.price)
      const size = toNum(l.size)
      return { price, size, total: price * size }
    })
    .filter((l) => l.size > 0)
}

export function snapshotFromBook(
  bids: RawLevel[],
  asks: RawLevel[],
  lastPrice: number | null = null
): OrderBookSnapshot {
  const bidLevels = buildLevels(bids).sort((a, b) => b.price - a.price)
  const askLevels = buildLevels(asks).sort((a, b) => a.price - b.price)

  const bestBid = bidLevels[0]?.price ?? null
  const bestAsk = askLevels[0]?.price ?? null

  let spread: number | null = null
  if (bestBid != null && bestAsk != null) {
    spread = Math.max(0, bestAsk - bestBid)
  }

  const totalBidValue = bidLevels.reduce((s, l) => s + l.total, 0)
  const totalAskValue = askLevels.reduce((s, l) => s + l.total, 0)

  return {
    bids: bidLevels,
    asks: askLevels.slice().reverse(),
    lastPrice: lastPrice ?? bestBid ?? bestAsk,
    spread,
    totalBidValue,
    totalAskValue,
  }
}

export function applyPriceChange(
  book: OrderBookSnapshot,
  price: number,
  size: number,
  side: 'BUY' | 'SELL'
): OrderBookSnapshot {
  const levels = side === 'BUY' ? [...book.bids] : [...book.asks]
  const idx = levels.findIndex((l) => Math.abs(l.price - price) < 0.0001)

  if (size <= 0) {
    if (idx >= 0) levels.splice(idx, 1)
  } else if (idx >= 0) {
    levels[idx] = { price, size, total: price * size }
  } else {
    levels.push({ price, size, total: price * size })
  }

  const bids = side === 'BUY' ? levels : book.bids
  const asks = side === 'SELL' ? levels : book.asks

  return snapshotFromBook(
    bids.map((l) => ({ price: String(l.price), size: String(l.size) })),
    asks.map((l) => ({ price: String(l.price), size: String(l.size) })),
    book.lastPrice
  )
}

export function getVisibleBookLevels(
  snapshot: OrderBookSnapshot,
  maxLevels = 10
): { asks: BookLevel[]; bids: BookLevel[] } {
  const asks = snapshot.asks.slice(-maxLevels)
  const bids = snapshot.bids.slice(0, maxLevels)
  return { asks, bids }
}

export function getBarTotal(levels: BookLevel[]): number {
  return levels.reduce((sum, l) => sum + l.total, 0) || 1
}

export function formatCents(price: number): string {
  const cents = Math.round(price * 100)
  return `${cents}¢`
}

export function formatShares(size: number): string {
  return size.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
