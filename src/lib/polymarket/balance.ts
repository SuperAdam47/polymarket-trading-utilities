import {
  createPublicClient,
  erc20Abi,
  fallback,
  formatUnits,
  http,
  type PublicClient,
} from 'viem'
import { polygon } from 'viem/chains'
import { POLYGON_RPC_URL } from './config'
import type { WalletAddress } from './config'

const PUSD_ADDRESS = '0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB' as const
const USDC_E_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const

const COLLATERAL_TOKENS = [
  { symbol: 'pUSD', address: PUSD_ADDRESS },
  { symbol: 'USDC.e', address: USDC_E_ADDRESS },
  { symbol: 'USDC', address: USDC_ADDRESS },
] as const

const RPC_FALLBACKS = [
  POLYGON_RPC_URL,
  'https://polygon-bor-rpc.publicnode.com',
  'https://1rpc.io/matic',
  'https://rpc.ankr.com/polygon',
  'https://polygon.llamarpc.com',
].filter(Boolean)

let publicClient: PublicClient | null = null

function getPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: polygon,
      transport: fallback(RPC_FALLBACKS.map((url) => http(url, { timeout: 10_000 }))),
    })
  }
  return publicClient
}

async function readTokenBalance(
  tokenAddress: `0x${string}`,
  wallet: WalletAddress
): Promise<number> {
  const client = getPublicClient()
  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [wallet],
  })
  return Number(formatUnits(balance, 6))
}

export async function fetchCashBalance(address: WalletAddress): Promise<number> {
  const balances = await Promise.allSettled(
    COLLATERAL_TOKENS.map((token) => readTokenBalance(token.address, address))
  )

  return balances.reduce((total, result) => {
    if (result.status === 'fulfilled') return total + result.value
    return total
  }, 0)
}

// Backwards-compatible alias
export const fetchUsdcBalance = fetchCashBalance
