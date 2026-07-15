import type { WalletAddress } from './config'

export type PnlTimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'ALL'

export type PnlChartPeriod = '1D' | '1W' | '1M' | '1Y' | 'YTD' | 'ALL'

export type PortfolioTab = 'positions' | 'Open orders' | 'history'

export type ActivityType =
  | 'TRADE'
  | 'SPLIT'
  | 'MERGE'
  | 'REDEEM'
  | 'REWARD'
  | 'CONVERSION'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'YIELD'
  | 'MAKER_REBATE'
  | 'TAKER_REBATE'
  | 'REFERRAL_REWARD'

export type PositionSortBy =
  | 'CURRENT'
  | 'INITIAL'
  | 'TOKENS'
  | 'CASHPNL'
  | 'PERCENTPNL'
  | 'TITLE'
  | 'PRICE'
  | 'AVGPRICE'

export interface PublicProfile {
  createdAt?: string | null
  proxyWallet?: string | null
  profileImage?: string | null
  displayUsernamePublic?: boolean | null
  bio?: string | null
  pseudonym?: string | null
  name?: string | null
  xUsername?: string | null
  verifiedBadge?: boolean | null
}

export interface Position {
  proxyWallet: WalletAddress
  asset: string
  conditionId: string
  size: number
  avgPrice: number
  initialValue: number
  currentValue: number
  cashPnl: number
  percentPnl: number
  totalBought: number
  realizedPnl: number
  percentRealizedPnl: number
  curPrice: number
  redeemable: boolean
  mergeable: boolean
  title: string
  slug: string
  icon: string
  eventSlug?: string
  outcome: string
  outcomeIndex: number
  oppositeOutcome: string
  oppositeAsset: string
  endDate?: string
  negativeRisk: boolean
}

export interface ClosedPosition {
  proxyWallet: WalletAddress
  asset: string
  conditionId: string
  avgPrice: number
  totalBought: number
  realizedPnl: number
  curPrice: number
  timestamp: number
  title: string
  slug: string
  icon: string
  eventSlug?: string
  outcome: string
  outcomeIndex: number
  oppositeOutcome: string
  oppositeAsset: string
  endDate?: string
}

export interface Activity {
  proxyWallet: WalletAddress
  timestamp: number
  conditionId: string
  type: ActivityType
  size: number
  usdcSize: number
  transactionHash: string
  price: number
  asset: string
  side: 'BUY' | 'SELL' | ''
  outcomeIndex: number
  title: string
  slug: string
  icon: string
  eventSlug?: string
  outcome: string
  name?: string
  pseudonym?: string
}

export interface ValueResponse {
  user: WalletAddress
  value: number
}

export interface TradedResponse {
  user: WalletAddress
  traded: number
}

export interface LeaderboardEntry {
  rank: string
  proxyWallet: WalletAddress
  userName: string
  vol: number
  pnl: number
  profileImage: string
  xUsername: string
  verifiedBadge: boolean
}

export interface PortfolioSummary {
  positionsValue: number
  cashBalance: number
  portfolioTotal: number
  dailyPnl: number
  dailyPnlPercent: number
  username: string
}

export interface PnlChartPoint {
  timestamp: number
  value: number
}

export interface UserPnlApiPoint {
  t: number
  p: number
}

export interface UserProfitEntry {
  proxyWallet: WalletAddress
  amount: number
  pseudonym?: string
  name?: string
}
