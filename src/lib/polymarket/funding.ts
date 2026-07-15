import { RELAY_API_URL, BRIDGE_API_URL } from './config'
import type { WalletAddress } from './config'
import { fetchCashBalance } from './balance'
import {
  dedupeActivities,
  fetchActivity,
  fetchPublicProfile,
} from './endpoints'
import type { Activity } from './types'

const PUSD_ADDRESS = '0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb'
const USDC_E_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const USDC_ADDRESS = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'

const COLLATERAL_TOKENS = new Set(
  [PUSD_ADDRESS, USDC_E_ADDRESS, USDC_ADDRESS].map((a) => a.toLowerCase())
)

type RelayStateChange = {
  address?: string
  change?: {
    balanceDiff?: string
    data?: { tokenAddress?: string }
  }
}

type RelayTransaction = {
  hash?: string
  timestamp?: number
  stateChanges?: RelayStateChange[]
}

type RelayRequest = {
  id: string
  status: string
  user?: string
  recipient?: string
  createdAt?: string
  data?: {
    metadata?: {
      currencyIn?: { amountFormatted?: string }
      currencyOut?: { amountFormatted?: string }
    }
    inTxs?: RelayTransaction[]
    outTxs?: RelayTransaction[]
  }
}

type RelayRequestsResponse = {
  requests?: RelayRequest[]
  continuation?: string
}

function walletCollateralChange(
  tx: RelayTransaction | undefined,
  wallet: string
): RelayStateChange | undefined {
  return tx?.stateChanges?.find((change) => {
    if (change.address?.toLowerCase() !== wallet) return false
    const token = change.change?.data?.tokenAddress?.toLowerCase()
    return token ? COLLATERAL_TOKENS.has(token) : false
  })
}

function netWalletCollateralDelta(
  request: RelayRequest,
  wallet: string
): number {
  let net = 0

  for (const tx of [
    ...(request.data?.inTxs ?? []),
    ...(request.data?.outTxs ?? []),
  ]) {
    for (const change of tx.stateChanges ?? []) {
      if (change.address?.toLowerCase() !== wallet) continue
      const token = change.change?.data?.tokenAddress?.toLowerCase()
      if (!token || !COLLATERAL_TOKENS.has(token)) continue
      net += Number(change.change?.balanceDiff ?? 0)
    }
  }

  return net
}

function createFundingActivity(
  wallet: WalletAddress,
  type: 'DEPOSIT' | 'WITHDRAWAL',
  usdcSize: number,
  timestamp: number,
  transactionHash: string
): Activity {
  return {
    proxyWallet: wallet,
    timestamp,
    conditionId: '',
    type,
    size: 0,
    usdcSize,
    transactionHash,
    price: 0,
    asset: '',
    side: '',
    outcomeIndex: 0,
    title: type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal',
    slug: '',
    icon: '',
    outcome: '',
  }
}

function parseAmount(raw: string | undefined, fallback?: string): number {
  if (raw) {
    const value = Number(raw)
    if (Number.isFinite(value)) return Math.abs(value) / 1e6
  }
  if (fallback) {
    const value = Number(fallback)
    if (Number.isFinite(value)) return Math.abs(value)
  }
  return 0
}

function relayRequestToActivity(
  request: RelayRequest,
  wallet: WalletAddress
): Activity | null {
  if (request.status !== 'success') return null

  const walletLower = wallet.toLowerCase()
  const inTx = request.data?.inTxs?.[0]
  const outTx = request.data?.outTxs?.[0]
  const metadata = request.data?.metadata
  const timestamp =
    inTx?.timestamp ??
    outTx?.timestamp ??
    Math.floor(new Date(request.createdAt ?? 0).getTime() / 1000)

  const inChange = walletCollateralChange(inTx, walletLower)
  const outChange = walletCollateralChange(outTx, walletLower)
  const transactionHash = inTx?.hash ?? outTx?.hash ?? request.id
  const netDelta = netWalletCollateralDelta(request, walletLower)

  if (netDelta > 0) {
    return createFundingActivity(
      wallet,
      'DEPOSIT',
      parseAmount(String(netDelta), metadata?.currencyOut?.amountFormatted),
      timestamp,
      transactionHash
    )
  }

  if (netDelta < 0) {
    return createFundingActivity(
      wallet,
      'WITHDRAWAL',
      parseAmount(String(netDelta), metadata?.currencyIn?.amountFormatted),
      timestamp,
      transactionHash
    )
  }

  if (
    request.recipient?.toLowerCase() === walletLower &&
    outChange &&
    Number(outChange.change?.balanceDiff) > 0
  ) {
    return createFundingActivity(
      wallet,
      'DEPOSIT',
      parseAmount(
        outChange.change?.balanceDiff,
        metadata?.currencyOut?.amountFormatted
      ),
      timestamp,
      transactionHash
    )
  }

  if (
    request.user?.toLowerCase() === walletLower &&
    inChange &&
    Number(inChange.change?.balanceDiff) < 0
  ) {
    return createFundingActivity(
      wallet,
      'WITHDRAWAL',
      parseAmount(
        inChange.change?.balanceDiff,
        metadata?.currencyIn?.amountFormatted
      ),
      timestamp,
      transactionHash
    )
  }

  if (request.recipient?.toLowerCase() === walletLower && metadata?.currencyOut) {
    return createFundingActivity(
      wallet,
      'DEPOSIT',
      Number(metadata.currencyOut.amountFormatted ?? 0),
      timestamp,
      transactionHash
    )
  }

  if (request.user?.toLowerCase() === walletLower && metadata?.currencyIn) {
    return createFundingActivity(
      wallet,
      'WITHDRAWAL',
      Number(metadata.currencyIn.amountFormatted ?? 0),
      timestamp,
      transactionHash
    )
  }

  return null
}

type BridgeTransaction = {
  status?: string
  txHash?: string
  createdTimeMs?: number
  fromAmountBaseUnit?: string
}

type BridgeStatusResponse = {
  transactions?: BridgeTransaction[]
}

type BridgeDepositResponse = {
  address?: { evm?: string }
}

async function fetchBridgeDeposits(wallet: WalletAddress): Promise<Activity[]> {
  try {
    const depositResponse = await fetch(`${BRIDGE_API_URL}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: wallet }),
    })

    if (!depositResponse.ok) return []

    const depositData = (await depositResponse.json()) as BridgeDepositResponse
    const bridgeAddress = depositData.address?.evm
    if (!bridgeAddress) return []

    const statusResponse = await fetch(
      `${BRIDGE_API_URL}/status/${bridgeAddress}`
    )
    if (!statusResponse.ok) return []

    const statusData = (await statusResponse.json()) as BridgeStatusResponse
    const completed =
      statusData.transactions?.filter((tx) => tx.status === 'COMPLETED') ?? []

    const activities: Activity[] = []

    for (const tx of completed) {
      const amount = Number(tx.fromAmountBaseUnit ?? 0) / 1e6
      if (!Number.isFinite(amount) || amount <= 0) continue

      const timestamp = tx.createdTimeMs
        ? Math.floor(tx.createdTimeMs / 1000)
        : 0
      if (!timestamp) continue

      activities.push(
        createFundingActivity(
          wallet,
          'DEPOSIT',
          amount,
          timestamp,
          tx.txHash ?? `bridge:${timestamp}:${amount}`
        )
      )
    }

    return activities
  } catch {
    return []
  }
}

const RELAY_MAX_PAGES = 20
const ACTIVITY_TOTAL_MAX_PAGES = 100
const RECONCILED_DEPOSIT_MIN_USD = 50

type ActivityFundingTotals = {
  buyTotal: number
  sellTotal: number
  redeemTotal: number
  rebateTotal: number
  earliestTimestamp: number | null
}

async function fetchActivityFundingTotals(
  address: WalletAddress
): Promise<ActivityFundingTotals> {
  let buyTotal = 0
  let sellTotal = 0
  let redeemTotal = 0
  let rebateTotal = 0
  let earliestTimestamp: number | null = null

  for (let page = 0; page < ACTIVITY_TOTAL_MAX_PAGES; page += 1) {
    const batch = await fetchActivity(address, {
      limit: 100,
      offset: page * 100,
    }).catch(() => [] as Activity[])

    if (!batch.length) break

    for (const activity of batch) {
      if (earliestTimestamp === null || activity.timestamp < earliestTimestamp) {
        earliestTimestamp = activity.timestamp
      }

      if (activity.type === 'TRADE' && activity.side === 'BUY') {
        buyTotal += activity.usdcSize
      }
      if (activity.type === 'TRADE' && activity.side === 'SELL') {
        sellTotal += activity.usdcSize
      }
      if (activity.type === 'REDEEM' && activity.usdcSize > 0) {
        redeemTotal += activity.usdcSize
      }
      if (activity.type === 'TAKER_REBATE' || activity.type === 'MAKER_REBATE') {
        rebateTotal += activity.usdcSize
      }
    }

    if (batch.length < 100) break
  }

  return { buyTotal, sellTotal, redeemTotal, rebateTotal, earliestTimestamp }
}

async function fetchReconciledDeposits(
  address: WalletAddress,
  knownFunding: Activity[]
): Promise<Activity[]> {
  try {
    const [profile, cashBalance, totals] = await Promise.all([
      fetchPublicProfile(address),
      fetchCashBalance(address),
      fetchActivityFundingTotals(address),
    ])

    const knownDepositTotal = knownFunding
      .filter((activity) => activity.type === 'DEPOSIT')
      .reduce((sum, activity) => sum + activity.usdcSize, 0)

    const knownWithdrawalTotal = knownFunding
      .filter((activity) => activity.type === 'WITHDRAWAL')
      .reduce((sum, activity) => sum + activity.usdcSize, 0)

    const requiredDeposits =
      totals.buyTotal +
      knownWithdrawalTotal -
      totals.sellTotal -
      totals.redeemTotal -
      totals.rebateTotal -
      cashBalance

    const gap = requiredDeposits - knownDepositTotal
    if (gap < RECONCILED_DEPOSIT_MIN_USD) return []

    const profileTimestamp = profile?.createdAt
      ? Math.floor(new Date(profile.createdAt).getTime() / 1000)
      : null
    const timestamp =
      profileTimestamp ??
      (totals.earliestTimestamp
        ? totals.earliestTimestamp - 3600
        : Math.floor(Date.now() / 1000))

    const earliestKnownDeposit = knownFunding
      .filter((activity) => activity.type === 'DEPOSIT')
      .reduce<number | null>(
        (earliest, activity) =>
          earliest === null || activity.timestamp < earliest
            ? activity.timestamp
            : earliest,
        null
      )

    const depositTimestamp =
      earliestKnownDeposit !== null && timestamp >= earliestKnownDeposit
        ? earliestKnownDeposit - 3600
        : timestamp

    return [
      createFundingActivity(
        address,
        'DEPOSIT',
        Math.round(gap * 100) / 100,
        depositTimestamp,
        `deposit:reconciled:${address.toLowerCase()}`
      ),
    ]
  } catch {
    return []
  }
}

async function fetchRelayRequests(wallet: WalletAddress): Promise<RelayRequest[]> {
  const requests: RelayRequest[] = []
  let continuation: string | undefined

  for (let page = 0; page < RELAY_MAX_PAGES; page += 1) {
    const url = new URL(`${RELAY_API_URL}/requests/v2`)
    url.searchParams.set('user', wallet.toLowerCase())
    url.searchParams.set('limit', '50')
    if (continuation) url.searchParams.set('continuation', continuation)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Relay API error: ${response.status}`)
    }

    const data = (await response.json()) as RelayRequestsResponse
    requests.push(...(data.requests ?? []))
    continuation = data.continuation
    if (!continuation) break
  }

  return requests
}

export async function fetchFundingActivity(
  address: WalletAddress
): Promise<Activity[]> {
  const [requests, bridgeDeposits] = await Promise.all([
    fetchRelayRequests(address),
    fetchBridgeDeposits(address),
  ])

  const relayActivities = requests
    .map((request) => relayRequestToActivity(request, address))
    .filter((activity): activity is Activity => activity !== null)

  const indexedDeposits = dedupeActivities([...relayActivities, ...bridgeDeposits])
  const reconciledDeposits = await fetchReconciledDeposits(
    address,
    indexedDeposits
  )

  const activities = dedupeActivities([
    ...indexedDeposits,
    ...reconciledDeposits,
  ])
  activities.sort((a, b) => b.timestamp - a.timestamp)
  return activities
}

export function mergeFundingActivities(
  activities: Activity[],
  fundingActivities: Activity[]
): Activity[] {
  if (!fundingActivities.length) return activities

  const merged = dedupeActivities([...activities, ...fundingActivities])
  merged.sort((a, b) => b.timestamp - a.timestamp)
  return merged
}
