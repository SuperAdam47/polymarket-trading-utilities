import { formatDistanceToNowStrict } from 'date-fns'

export function formatUsd(value: number, decimals = 2): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  if (value < 0) return `-$${formatted}`
  return `$${formatted}`
}

export function formatHeaderUsd(value: number): string {
  const decimals = Math.abs(value) >= 1000 ? 0 : 2
  return formatUsd(value, decimals)
}

export function formatUsdSigned(value: number, decimals = 2): string {
  if (value > 0) return `+${formatUsd(value, decimals)}`
  return formatUsd(value, decimals)
}

export function formatCents(price: number): string {
  return `${(price * 100).toFixed(price * 100 >= 10 ? 1 : 1)}¢`
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatShares(size: number): string {
  return size.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function formatRelativeTimeShort(timestamp: number): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp * 1000) / 1000)
  )

  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  return formatDistanceToNowStrict(new Date(timestamp * 1000), {
    addSuffix: true,
  })
}

export function formatJoinedDate(isoDate?: string | null): string {
  if (!isoDate) return 'Joined recently'
  const date = new Date(isoDate)
  return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
}

export function truncateTitle(title: string, max = 48): string {
  if (title.length <= max) return title
  return `${title.slice(0, max)}...`
}

export function formatShortAddress(address: string, prefix = 6, suffix = 4): string {
  if (address.length <= prefix + suffix + 3) return address
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`
}
