import { gammaClient } from './client'

export type MarketAsset = 'btc' | 'eth' | 'sol' | 'xrp'
export type MarketInterval = 5 | 15

export interface MarketSelection {
  asset: MarketAsset
  interval: MarketInterval
}

export interface CryptoUpDownMarket {
  slug: string
  question: string
  conditionId: string
  upTokenId: string
  downTokenId: string
  endDate: string | null
  asset: MarketAsset
  interval: MarketInterval
}

export const MARKET_OPTIONS: {
  selection: MarketSelection
  label: string
}[] = [
  { selection: { asset: 'btc', interval: 5 }, label: 'Bitcoin · 5m' },
  { selection: { asset: 'btc', interval: 15 }, label: 'Bitcoin · 15m' },
  { selection: { asset: 'eth', interval: 5 }, label: 'Ethereum · 5m' },
  { selection: { asset: 'eth', interval: 15 }, label: 'Ethereum · 15m' },
  { selection: { asset: 'sol', interval: 5 }, label: 'Solana · 5m' },
  { selection: { asset: 'sol', interval: 15 }, label: 'Solana · 15m' },
  { selection: { asset: 'xrp', interval: 5 }, label: 'XRP · 5m' },
  { selection: { asset: 'xrp', interval: 15 }, label: 'XRP · 15m' },
]

export const DEFAULT_MARKET_SELECTION: MarketSelection = {
  asset: 'btc',
  interval: 5,
}

interface GammaMarket {
  slug: string
  question: string
  conditionId: string
  clobTokenIds: string
  outcomes: string
  active: boolean
  closed: boolean
  endDate?: string
}

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function selectionKey(selection: MarketSelection): string {
  return `${selection.asset}-${selection.interval}m`
}

export function parseSelectionKey(key: string): MarketSelection | null {
  const match = key.match(/^(btc|eth|sol|xrp)-(5|15)m$/)
  if (!match) return null
  return {
    asset: match[1] as MarketAsset,
    interval: Number(match[2]) as MarketInterval,
  }
}

export function getWindowTimestamp(
  interval: MarketInterval,
  offsetWindows = 0
): number {
  const intervalSec = interval * 60
  const now = Math.floor(Date.now() / 1000)
  return (
    Math.floor(now / intervalSec) * intervalSec + offsetWindows * intervalSec
  )
}

function toMarket(
  data: GammaMarket,
  selection: MarketSelection
): CryptoUpDownMarket | null {
  const tokenIds = parseJsonArray(data.clobTokenIds)
  const outcomes = parseJsonArray(data.outcomes)
  if (tokenIds.length < 2 || outcomes.length < 2) return null

  const upIdx = outcomes.findIndex((o) => o.toLowerCase() === 'up')
  const downIdx = outcomes.findIndex((o) => o.toLowerCase() === 'down')
  if (upIdx < 0 || downIdx < 0) return null

  return {
    slug: data.slug,
    question: data.question,
    conditionId: data.conditionId,
    upTokenId: tokenIds[upIdx],
    downTokenId: tokenIds[downIdx],
    endDate: data.endDate ?? null,
    asset: selection.asset,
    interval: selection.interval,
  }
}

async function fetchBySlug(
  slug: string,
  selection: MarketSelection
): Promise<CryptoUpDownMarket | null> {
  try {
    const { data } = await gammaClient.get<GammaMarket>(`/markets/slug/${slug}`)
    if (!data?.active || data.closed) return null
    return toMarket(data, selection)
  } catch {
    return null
  }
}

function slugPrefix(selection: MarketSelection): string {
  return `${selection.asset}-updown-${selection.interval}m-`
}

export async function fetchCurrentMarket(
  selection: MarketSelection
): Promise<CryptoUpDownMarket | null> {
  const intervalSec = selection.interval * 60
  const ts = getWindowTimestamp(selection.interval)
  const prefix = slugPrefix(selection)

  const current = await fetchBySlug(`${prefix}${ts}`, selection)
  if (current) return current

  // Brief overlap at window boundaries — previous window may still be listed
  const previous = await fetchBySlug(`${prefix}${ts - intervalSec}`, selection)
  if (previous) return previous

  return null
}

export async function fetchCurrentMarketWithRetry(
  selection: MarketSelection,
  attempts = 12,
  delayMs = 1000
): Promise<CryptoUpDownMarket | null> {
  for (let i = 0; i < attempts; i += 1) {
    const market = await fetchCurrentMarket(selection)
    if (market) {
      const expectedTs = getWindowTimestamp(selection.interval)
      if (market.slug.endsWith(String(expectedTs))) return market
      // Stale previous-window market — keep polling for the new one
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return fetchCurrentMarket(selection)
}

export function msUntilNextWindow(interval: MarketInterval): number {
  const intervalSec = interval * 60
  const next = (getWindowTimestamp(interval) + intervalSec) * 1000
  return Math.max(0, next - Date.now())
}

export function formatTimeRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// Backwards-compatible aliases
export type Btc5mMarket = CryptoUpDownMarket
export const fetchCurrentBtc5mMarket = () =>
  fetchCurrentMarket(DEFAULT_MARKET_SELECTION)
