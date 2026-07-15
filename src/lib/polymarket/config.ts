export type WalletAddress = `0x${string}`

export const GAMMA_API_URL =
  import.meta.env.VITE_GAMMA_API_URL ?? 'https://gamma-api.polymarket.com'
export const DATA_API_URL =
  import.meta.env.VITE_DATA_API_URL ?? 'https://data-api.polymarket.com'

export const POLYGON_RPC_URL =
  import.meta.env.VITE_POLYGON_RPC_URL ?? 'https://polygon-bor-rpc.publicnode.com'

export const USER_PNL_API_URL =
  import.meta.env.VITE_USER_PNL_API_URL ?? 'https://user-pnl-api.polymarket.com'

export const LB_API_URL =
  import.meta.env.VITE_LB_API_URL ?? 'https://lb-api.polymarket.com'

export const RELAY_API_URL =
  import.meta.env.VITE_RELAY_API_URL ?? 'https://api.relay.link'

export const BRIDGE_API_URL =
  import.meta.env.VITE_BRIDGE_API_URL ?? 'https://bridge.polymarket.com'

export function getWalletAddress(): WalletAddress {
  const addr = import.meta.env.VITE_POLYMARKET_WALLET_ADDRESS
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    throw new Error('VITE_POLYMARKET_WALLET_ADDRESS is required')
  }
  return addr as WalletAddress
}

export function tryGetWalletAddress(): WalletAddress | null {
  const addr = import.meta.env.VITE_POLYMARKET_WALLET_ADDRESS
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) return null
  return addr as WalletAddress
}

