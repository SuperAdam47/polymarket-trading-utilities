import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCashBalance } from '@/lib/polymarket/balance'
import { getWalletAddress } from '@/lib/polymarket/config'
import { useOptionalProfileAddress } from '@/features/polymarket/profile/profile-address-context'
import {
  fetchActivity,
  fetchFullActivity,
  fetchActivePositionsValue,
  fetchBiggestWin,
  fetchClosedPositions,
  fetchLeaderboardPnl,
  fetchPositions,
  fetchPublicProfile,
  fetchTradedCount,
  fetchUserPnlSeries,
  fetchUserProfit,
  fetchUsername,
} from '@/lib/polymarket/endpoints'
import { fetchFundingActivity } from '@/lib/polymarket/funding'
import {
  getPnlApiParams,
  getPnlFilterStartMs,
  transformUserPnlSeries,
} from '@/lib/polymarket/pnl'
import type { PnlChartPeriod, PnlTimePeriod, PositionSortBy } from '@/lib/polymarket/types'
import type { WalletAddress } from '@/lib/polymarket/config'

function useQueryAddress(): WalletAddress {
  const profileAddress = useOptionalProfileAddress()
  return profileAddress ?? getWalletAddress()
}

export function useWalletAddress() {
  return useQueryAddress()
}

export function usePublicProfile() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['profile', address],
    queryFn: () => fetchPublicProfile(address),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUsername() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['username', address],
    queryFn: () => fetchUsername(address),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePortfolioSummary() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['summary', address],
    queryFn: async () => {
      const [positionsValue, cashBalance, leaderboard, username, dailyProfit, dayPnlSeries] =
        await Promise.all([
          fetchActivePositionsValue(address),
          fetchCashBalance(address),
          fetchLeaderboardPnl(address, 'DAY'),
          fetchUsername(address),
          fetchUserProfit(address, '1d'),
          fetchUserPnlSeries(address, { interval: '1d', fidelity: '1h' }).catch(
            () => []
          ),
        ])

      const portfolioTotal = positionsValue + cashBalance
      const seriesPnl = transformUserPnlSeries(dayPnlSeries, '1D').pnl
      const dailyPnl = dailyProfit ?? leaderboard?.pnl ?? seriesPnl
      const previousTotal = portfolioTotal - dailyPnl
      const dailyPnlPercent =
        previousTotal !== 0 ? (dailyPnl / Math.abs(previousTotal)) * 100 : 0

      return {
        positionsValue,
        cashBalance,
        portfolioTotal,
        dailyPnl,
        dailyPnlPercent,
        username,
      }
    },
    refetchInterval: 30_000,
  })
}

export function usePositions(options?: {
  sortBy?: PositionSortBy
  limit?: number
  offset?: number
}) {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['positions', address, options],
    queryFn: () => fetchPositions(address, options),
    refetchInterval: 30_000,
  })
}

export function useActivePositions() {
  const query = usePositions({ sortBy: 'CURRENT' })
  return {
    ...query,
    data: query.data?.filter(
      (p) => p.size > 0.1 && p.currentValue > 0 && !p.redeemable
    ),
  }
}

export function useRedeemablePositions() {
  const query = usePositions()
  return {
    ...query,
    data: query.data?.filter((p) => p.redeemable && p.size > 0.1),
  }
}

export function useClosedPositions() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['closed', address],
    queryFn: () => fetchClosedPositions(address),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBiggestWin() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['biggestWin', address],
    queryFn: () => fetchBiggestWin(address),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTradedCount() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['traded', address],
    queryFn: () => fetchTradedCount(address),
    staleTime: 5 * 60 * 1000,
  })
}

export function useActivity(options?: {
  limit?: number
  offset?: number
  type?: string
}) {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['activity', address, options],
    queryFn: () => fetchActivity(address, options),
    refetchInterval: 60_000,
  })
}

export function useFullActivity() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['activity', 'full', address],
    queryFn: () => fetchFullActivity(address),
    refetchInterval: 60_000,
  })
}

export function useFundingActivity() {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['funding', address],
    queryFn: () => fetchFundingActivity(address),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  })
}

export function useLeaderboardPnl(timePeriod: PnlTimePeriod = 'DAY') {
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['pnl', address, timePeriod],
    queryFn: () => fetchLeaderboardPnl(address, timePeriod),
    refetchInterval: 60_000,
  })
}

export function usePnlChart(period: PnlChartPeriod) {
  const address = useWalletAddress()
  const apiParams = getPnlApiParams(period)

  const seriesQuery = useQuery({
    queryKey: [
      'user-pnl-series',
      address,
      apiParams.interval,
      apiParams.fidelity,
    ],
    queryFn: () =>
      fetchUserPnlSeries(address, {
        interval: apiParams.interval,
        fidelity: apiParams.fidelity,
      }),
    refetchInterval: 60_000,
  })

  const transformed = useMemo(
    () =>
      transformUserPnlSeries(
        seriesQuery.data ?? [],
        period,
        getPnlFilterStartMs(period)
      ),
    [seriesQuery.data, period]
  )

  return {
    chartData: transformed.chartData,
    pnl: transformed.pnl,
    isLoading: seriesQuery.isLoading,
  }
}
