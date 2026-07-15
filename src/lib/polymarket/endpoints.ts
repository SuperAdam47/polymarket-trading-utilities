import type { WalletAddress } from './config'
import { dataClient, gammaClient, lbClient, userPnlClient } from './client'
import type {
  Activity,
  ClosedPosition,
  LeaderboardEntry,
  PnlTimePeriod,
  Position,
  PositionSortBy,
  PublicProfile,
  TradedResponse,
  UserPnlApiPoint,
  UserProfitEntry,
  ValueResponse,
} from './types'

export async function fetchPublicProfile(
  address: WalletAddress
): Promise<PublicProfile | null> {
  try {
    const { data } = await gammaClient.get<PublicProfile>('/public-profile', {
      params: { address },
    })
    return data
  } catch {
    return null
  }
}

export async function fetchPositionsValue(
  address: WalletAddress
): Promise<number> {
  const { data } = await dataClient.get<ValueResponse[]>('/value', {
    params: { user: address },
  })
  return data[0]?.value ?? 0
}

export async function fetchPositions(
  address: WalletAddress,
  params?: {
    limit?: number
    offset?: number
    sortBy?: PositionSortBy
    sortDirection?: 'ASC' | 'DESC'
    sizeThreshold?: number
  }
): Promise<Position[]> {
  const { data } = await dataClient.get<Position[]>('/positions', {
    params: {
      user: address,
      sizeThreshold: 0.1,
      limit: 100,
      sortBy: 'CURRENT',
      sortDirection: 'DESC',
      ...params,
    },
  })
  return data
}

export async function fetchClosedPositions(
  address: WalletAddress,
  params?: {
    limit?: number
    offset?: number
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
  }
): Promise<ClosedPosition[]> {
  const { data } = await dataClient.get<ClosedPosition[]>('/closed-positions', {
    params: {
      user: address,
      limit: 50,
      sortBy: 'TIMESTAMP',
      sortDirection: 'DESC',
      ...params,
    },
  })
  return data
}

export async function fetchBiggestWin(
  address: WalletAddress
): Promise<number> {
  const { data } = await dataClient.get<ClosedPosition[]>('/closed-positions', {
    params: {
      user: address,
      limit: 1,
      sortBy: 'REALIZEDPNL',
      sortDirection: 'DESC',
    },
  })
  return data[0]?.realizedPnl ?? 0
}

export async function fetchTradedCount(
  address: WalletAddress
): Promise<number> {
  const { data } = await dataClient.get<TradedResponse>('/traded', {
    params: { user: address },
  })
  return data.traded
}

export async function fetchActivity(
  address: WalletAddress,
  params?: {
    limit?: number
    offset?: number
    type?: string
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
  }
): Promise<Activity[]> {
  const { data } = await dataClient.get<Activity[]>('/activity', {
    params: {
      user: address,
      limit: 50,
      sortBy: 'TIMESTAMP',
      sortDirection: 'DESC',
      ...params,
    },
  })
  return data
}

const ACTIVITY_PAGE_SIZE = 100
const ACTIVITY_MAX_PAGES = 15

const SUPPLEMENTAL_ACTIVITY_TYPES = [
  'MAKER_REBATE',
  'TAKER_REBATE',
  'REFERRAL_REWARD',
  'REWARD',
  'DEPOSIT',
  'WITHDRAWAL',
] as const

function activityDedupeKey(activity: Activity): string {
  return [
    activity.transactionHash.toLowerCase(),
    activity.timestamp,
    activity.type,
    activity.conditionId,
    activity.usdcSize,
  ].join(':')
}

export function dedupeActivities(activities: Activity[]): Activity[] {
  const seen = new Set<string>()
  const deduped: Activity[] = []

  for (const activity of activities) {
    const key = activityDedupeKey(activity)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(activity)
  }

  return deduped
}

async function fetchPaginatedActivity(
  address: WalletAddress
): Promise<Activity[]> {
  const activities: Activity[] = []

  for (let page = 0; page < ACTIVITY_MAX_PAGES; page += 1) {
    const batch = await fetchActivity(address, {
      limit: ACTIVITY_PAGE_SIZE,
      offset: page * ACTIVITY_PAGE_SIZE,
    })

    if (!batch.length) break
    activities.push(...batch)
    if (batch.length < ACTIVITY_PAGE_SIZE) break
  }

  return activities
}

async function fetchSupplementalActivities(
  address: WalletAddress
): Promise<Activity[]> {
  const batches = await Promise.all(
    SUPPLEMENTAL_ACTIVITY_TYPES.map(async (type) => {
      const activities: Activity[] = []

      for (let page = 0; page < 5; page += 1) {
        const batch = await fetchActivity(address, {
          limit: 100,
          offset: page * 100,
          type,
        }).catch(() => [] as Activity[])

        if (!batch.length) break
        activities.push(...batch)
        if (batch.length < 100) break
      }

      return activities
    })
  )

  return batches.flat()
}

export async function fetchFullActivity(
  address: WalletAddress
): Promise<Activity[]> {
  const [paginated, supplemental] = await Promise.all([
    fetchPaginatedActivity(address),
    fetchSupplementalActivities(address),
  ])

  const merged = dedupeActivities([...paginated, ...supplemental])
  merged.sort((a, b) => b.timestamp - a.timestamp)
  return merged
}

export async function fetchLeaderboardPnl(
  address: WalletAddress,
  timePeriod: PnlTimePeriod = 'DAY'
): Promise<LeaderboardEntry | null> {
  const { data } = await dataClient.get<LeaderboardEntry[]>('/v1/leaderboard', {
    params: { user: address, timePeriod, category: 'OVERALL' },
  })
  return data[0] ?? null
}

export async function fetchLeaderboardByUsername(
  username: string
): Promise<LeaderboardEntry | null> {
  const { data } = await dataClient.get<LeaderboardEntry[]>('/v1/leaderboard', {
    params: { userName: username, category: 'OVERALL', timePeriod: 'ALL' },
  })
  return data[0] ?? null
}

export async function fetchUserPnlSeries(
  address: WalletAddress,
  params: {
    interval: '1d' | '1w' | '1m' | 'max' | 'all'
    fidelity: '1h' | '3h' | '12h' | '1d'
  }
): Promise<UserPnlApiPoint[]> {
  const { data } = await userPnlClient.get<UserPnlApiPoint[]>('/user-pnl', {
    params: {
      user_address: address.toLowerCase(),
      interval: params.interval,
      fidelity: params.fidelity,
    },
  })
  return data
}

export async function fetchUserProfit(
  address: WalletAddress,
  window: '1d' | '7d' | '30d' | 'all'
): Promise<number | null> {
  const { data } = await lbClient.get<UserProfitEntry[]>('/profit', {
    params: {
      address: address.toLowerCase(),
      window,
      limit: 1,
    },
  })
  return data[0]?.amount ?? null
}

export async function fetchActivePositionsValue(
  address: WalletAddress
): Promise<number> {
  const positions = await fetchPositions(address, { limit: 500 })
  return positions
    .filter((p) => p.size > 0.1 && p.currentValue > 0 && !p.redeemable)
    .reduce((sum, p) => sum + p.currentValue, 0)
}

export async function fetchUsername(
  address: WalletAddress
): Promise<string> {
  const entry = await fetchLeaderboardPnl(address, 'ALL')
  if (entry?.userName) return entry.userName

  const activity = await fetchActivity(address, { limit: 1 })
  if (activity[0]?.name) return activity[0].name
  if (activity[0]?.pseudonym) return activity[0].pseudonym

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
