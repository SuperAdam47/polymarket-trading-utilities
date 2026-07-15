import type { WalletAddress } from './config'
import { fetchLeaderboardByUsername } from './endpoints'

const WALLET_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export function isWalletAddress(value: string): value is WalletAddress {
  return WALLET_ADDRESS_RE.test(value)
}

export function normalizeWalletAddress(value: string): WalletAddress {
  return value.toLowerCase() as WalletAddress
}

export function buildProfileSlug(options: {
  username?: string | null
  address: WalletAddress
}): string {
  const username = options.username?.trim()
  if (username) return username
  return options.address
}

export function buildProfilePath(options: {
  username?: string | null
  address: WalletAddress
}): `/${string}` {
  return `/${encodeURIComponent(buildProfileSlug(options))}`
}

export async function resolveProfileSlug(
  slug: string
): Promise<WalletAddress | null> {
  const decoded = decodeURIComponent(slug).trim()
  if (!decoded) return null

  if (isWalletAddress(decoded)) {
    return normalizeWalletAddress(decoded)
  }

  const entry = await fetchLeaderboardByUsername(decoded)
  if (entry?.proxyWallet && isWalletAddress(entry.proxyWallet)) {
    return normalizeWalletAddress(entry.proxyWallet)
  }

  return null
}
