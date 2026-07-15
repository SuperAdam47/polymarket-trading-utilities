import type { PnlChartPeriod, PnlChartPoint, UserPnlApiPoint } from './types'

type PnlApiInterval = '1d' | '1w' | '1m' | 'max' | 'all'
type PnlApiFidelity = '1h' | '3h' | '12h' | '1d'
type ProfitWindow = '1d' | '7d' | '30d' | 'all'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function getPnlApiParams(period: PnlChartPeriod): {
  interval: PnlApiInterval
  fidelity: PnlApiFidelity
} {
  switch (period) {
    case '1D':
      return { interval: '1d', fidelity: '1h' }
    case '1W':
      return { interval: '1w', fidelity: '3h' }
    case '1M':
      return { interval: '1m', fidelity: '12h' }
    case '1Y':
    case 'YTD':
    case 'ALL':
      return { interval: 'max', fidelity: '1d' }
  }
}

export function getPnlFilterStartMs(period: PnlChartPeriod): number | undefined {
  switch (period) {
    case '1Y':
      return Date.now() - ONE_YEAR_MS
    case 'YTD':
      return new Date(new Date().getFullYear(), 0, 1).getTime()
    default:
      return undefined
  }
}

export function getProfitWindow(period: PnlChartPeriod): ProfitWindow | null {
  switch (period) {
    case '1D':
      return '1d'
    case '1W':
      return '7d'
    case '1M':
      return '30d'
    case 'ALL':
      return 'all'
    case '1Y':
    case 'YTD':
      return null
  }
}

export function transformUserPnlSeries(
  raw: UserPnlApiPoint[],
  period: PnlChartPeriod,
  filterStartMs?: number
): { chartData: PnlChartPoint[]; pnl: number } {
  const sorted: PnlChartPoint[] = raw
    .map((point) => ({
      timestamp: point.t * 1000,
      value: point.p,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  if (sorted.length === 0) {
    return { chartData: [], pnl: 0 }
  }

  if (period === 'ALL') {
    return {
      chartData: sorted,
      pnl: sorted[sorted.length - 1].value,
    }
  }

  const windowPoints =
    filterStartMs !== undefined
      ? sorted.filter((point) => point.timestamp >= filterStartMs)
      : sorted

  if (windowPoints.length === 0) {
    return { chartData: [], pnl: 0 }
  }

  let baseline = windowPoints[0].value
  if (period === '1Y' && filterStartMs !== undefined) {
    for (const point of sorted) {
      if (point.timestamp < filterStartMs) {
        baseline = point.value
      } else {
        break
      }
    }
  }

  const last = windowPoints[windowPoints.length - 1].value
  const chartData = windowPoints.map((point) => ({
    timestamp: point.timestamp,
    value: point.value - baseline,
  }))

  return { chartData, pnl: last - baseline }
}

export function periodLabel(period: PnlChartPeriod): string {
  switch (period) {
    case '1D':
      return 'Past Day'
    case '1W':
      return 'Past Week'
    case '1M':
      return 'Past Month'
    case '1Y':
      return 'Past Year'
    case 'YTD':
      return 'Year to Date'
    case 'ALL':
      return 'All Time'
  }
}
