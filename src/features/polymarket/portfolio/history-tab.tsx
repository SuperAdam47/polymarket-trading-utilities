import { useMemo, useState } from 'react'
import { CloseLossesDialog } from '@/features/polymarket/components/close-losses-dialog'
import { MarketTitleTooltip } from '@/features/polymarket/components/market-title-tooltip'
import { getLossClosedPositions } from '@/features/polymarket/lib/loss-positions'
import { PortfolioTabShell } from '@/features/polymarket/components/portfolio-tab-shell'
import { PortfolioToolbarScroll } from '@/features/polymarket/components/portfolio-toolbar-scroll'
import {
  CalendarIcon,
  ClearIcon,
  ExportIcon,
  PortfolioFilterSelect,
  PortfolioSearchInput,
  PortfolioSortSelect,
  PortfolioToolbarButton,
} from '@/features/polymarket/components/portfolio-toolbar'
import { HistoryTableHeader } from '@/features/polymarket/components/sort-column-header'
import {
  formatCents,
  formatRelativeTimeShort,
  formatShares,
  formatUsdSigned,
} from '@/lib/polymarket/format'
import { useClosedPositions, useFullActivity, useFundingActivity, useWalletAddress } from '@/features/polymarket/hooks/use-polymarket-data'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WalletAddress } from '@/lib/polymarket/config'
import { mergeFundingActivities } from '@/lib/polymarket/funding'
import type {
  Activity,
  ClosedPosition,
  PortfolioTab,
} from '@/lib/polymarket/types'

type ActivityFilter =
  | 'ALL'
  | 'TRADES'
  | 'BUY'
  | 'MERGE'
  | 'REDEEM'
  | 'REFERRAL_REWARD'
  | 'SELL'
  | 'LOST'
  | 'MAKER_REBATE'
  | 'TAKER_REBATE'
  | 'DEPOSIT'
  | 'WITHDRAWAL'

type SortOption = 'NEWEST' | 'OLDEST' | 'VALUE'

const SORT_LABELS: Record<SortOption, string> = {
  NEWEST: 'Newest',
  OLDEST: 'Oldest',
  VALUE: 'Value',
}

const FILTER_LABELS: Record<ActivityFilter, string> = {
  ALL: 'All',
  TRADES: 'Trades',
  BUY: 'Buy',
  MERGE: 'Merge',
  REDEEM: 'Redeem',
  REFERRAL_REWARD: 'Referral Rewards',
  SELL: 'Sell',
  LOST: 'Lost',
  MAKER_REBATE: 'Maker Rebate',
  TAKER_REBATE: 'Taker Rebate',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdraw',
}

function matchesActivityFilter(
  activity: Activity,
  filter: ActivityFilter
): boolean {
  switch (filter) {
    case 'ALL':
      return true
    case 'TRADES':
      return activity.type === 'TRADE'
    case 'BUY':
      return activity.type === 'TRADE' && activity.side === 'BUY'
    case 'SELL':
      return activity.type === 'TRADE' && activity.side === 'SELL'
    case 'MERGE':
      return activity.type === 'MERGE'
    case 'REDEEM':
      return activity.type === 'REDEEM' && !isLossActivity(activity) && !isEmptyRedeemActivity(activity)
    case 'REFERRAL_REWARD':
      return activity.type === 'REFERRAL_REWARD' || activity.type === 'REWARD'
    case 'LOST':
      return isLossActivity(activity)
    case 'MAKER_REBATE':
      return activity.type === 'MAKER_REBATE'
    case 'TAKER_REBATE':
      return activity.type === 'TAKER_REBATE'
    case 'DEPOSIT':
      return activity.type === 'DEPOSIT'
    case 'WITHDRAWAL':
      return activity.type === 'WITHDRAWAL'
    default:
      return true
  }
}

function HistoryToolbar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
}: {
  search: string
  setSearch: (value: string) => void
  typeFilter: ActivityFilter
  setTypeFilter: (value: ActivityFilter) => void
  sortBy: SortOption
  setSortBy: (value: SortOption) => void
}) {
  const [closeLossesOpen, setCloseLossesOpen] = useState(false)

  return (
    <>
      <PortfolioSearchInput
        value={search}
        onChange={setSearch}
        expandOnDesktop={false}
      />
      <PortfolioToolbarButton
        label='Close Losses'
        icon={<ClearIcon />}
        onClick={() => setCloseLossesOpen(true)}
      />
      <CloseLossesDialog
        open={closeLossesOpen}
        onOpenChange={setCloseLossesOpen}
      />
      <PortfolioFilterSelect
        value={typeFilter}
        onChange={setTypeFilter}
        options={FILTER_LABELS}
        ariaLabel='Filter activity type'
      />
      <PortfolioSortSelect
        value={sortBy}
        onChange={setSortBy}
        options={SORT_LABELS}
        compactMobile={false}
      />
      <PortfolioToolbarButton label='Date' icon={<CalendarIcon />} />
      <PortfolioToolbarButton
        label='Export'
        icon={<ExportIcon />}
        className='max-lg:hidden'
      />
    </>
  )
}

function isLossActivity(activity: Activity): boolean {
  return activity.transactionHash.startsWith('loss:')
}

function isRebateActivity(activity: Activity): boolean {
  return activity.type === 'TAKER_REBATE' || activity.type === 'MAKER_REBATE'
}

function isFundingActivity(activity: Activity): boolean {
  return activity.type === 'DEPOSIT' || activity.type === 'WITHDRAWAL'
}

function isEmptyRedeemActivity(activity: Activity): boolean {
  return (
    activity.type === 'REDEEM' &&
    !isLossActivity(activity) &&
    activity.usdcSize <= 0
  )
}

function rebateTitle(activity: Activity): string {
  if (activity.title) return activity.title
  if (activity.type === 'MAKER_REBATE') return 'Maker rebate'
  return 'Taker rebate'
}

function rebateDetailLabel(activity: Activity): string {
  if (activity.type === 'MAKER_REBATE') return 'Maker rebate credited'
  return 'Taker rebate credited'
}

function lossFromClosedPosition(
  position: ClosedPosition,
  wallet: WalletAddress
): Activity {
  return {
    proxyWallet: position.proxyWallet ?? wallet,
    timestamp: position.timestamp,
    conditionId: position.conditionId,
    type: 'REDEEM',
    size: position.totalBought,
    usdcSize: 0,
    transactionHash: `loss:${position.conditionId}:${position.timestamp}`,
    price: position.avgPrice,
    asset: position.asset,
    side: '',
    outcomeIndex: position.outcomeIndex,
    title: position.title,
    slug: position.slug,
    icon: position.icon,
    eventSlug: position.eventSlug,
    outcome: position.outcome,
  }
}

function mergeHistoryActivities(
  activities: Activity[],
  closedPositions: ClosedPosition[],
  wallet: WalletAddress
): Activity[] {
  const losses = getLossClosedPositions(closedPositions, activities).map(
    (position) => lossFromClosedPosition(position, wallet)
  )

  const lossKeys = new Set(
    losses.map((loss) => `${loss.conditionId}:${loss.timestamp}`)
  )

  const filtered = activities.filter((activity) => {
    if (isEmptyRedeemActivity(activity)) return false
    if (!isLossActivity(activity)) return true
    return lossKeys.has(`${activity.conditionId}:${activity.timestamp}`)
  })

  const merged = [...filtered, ...losses]
  merged.sort((a, b) => b.timestamp - a.timestamp)
  return merged
}

function activityLabel(activity: Activity): string {
  if (isLossActivity(activity)) return 'Loss'
  if (isRebateActivity(activity)) return 'Rebate'
  if (activity.type === 'DEPOSIT') return 'Deposit'
  if (activity.type === 'WITHDRAWAL') return 'Withdraw'
  if (activity.type === 'REDEEM') return 'Redeem'
  if (activity.type === 'TRADE' && activity.side === 'BUY') return 'Buy'
  if (activity.type === 'TRADE' && activity.side === 'SELL') return 'Sell'
  return activity.type.charAt(0) + activity.type.slice(1).toLowerCase()
}

function activityValue(activity: Activity): number {
  if (isRebateActivity(activity)) return activity.usdcSize
  if (activity.type === 'DEPOSIT') return activity.usdcSize
  if (activity.type === 'WITHDRAWAL') return -activity.usdcSize
  if (activity.type === 'REDEEM') return activity.usdcSize
  if (activity.type === 'TRADE' && activity.side === 'BUY') return -activity.usdcSize
  if (activity.type === 'TRADE' && activity.side === 'SELL') return activity.usdcSize
  return activity.usdcSize
}

function RedeemIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-pm-green', className)}
    >
      <path
        fill='currentColor'
        d='M10 2c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8m3.709 4.655a.75.75 0 0 0-1.052.135l-3.701 4.79-1.648-1.833a.75.75 0 0 0-1.115 1.004l2.25 2.5a.75.75 0 0 0 .557.248h.028a.75.75 0 0 0 .565-.291l4.25-5.5v-.001a.75.75 0 0 0-.134-1.052'
      />
    </svg>
  )
}

function RedeemIconFilled({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className={cn('shrink-0 text-pm-green', className)}
    >
      <path
        fill='currentColor'
        d='M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.843,5.708l-4.25,5.5c-.136,.176-.343,.283-.565,.291-.01,0-.019,0-.028,0-.212,0-.415-.09-.558-.248l-2.25-2.5c-.277-.308-.252-.782,.056-1.06,.309-.276,.781-.252,1.06,.056l1.648,1.832,3.701-4.789c.253-.328,.725-.388,1.052-.135,.328,.253,.388,.724,.135,1.052Z'
      />
    </svg>
  )
}

function LossIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-red-500', className)}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 1.875a8.125 8.125 0 1 1 0 16.25 8.125 8.125 0 0 1 0-16.25m3.37 4.756a.876.876 0 0 0-1.24 0L10 8.76l-2.13-2.13a.877.877 0 0 0-1.24 1.238L8.763 10 6.63 12.13a.876.876 0 0 0 1.238 1.24L10 11.237l2.13 2.131a.876.876 0 0 0 1.24-1.238L11.237 10l2.131-2.13a.876.876 0 0 0 0-1.24'
      />
    </svg>
  )
}

function LossIconFilled({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className={cn('shrink-0 text-red-500', className)}
    >
      <path
        fill='currentColor'
        d='M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.28,10.22c.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22l-2.22-2.22-2.22,2.22c-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22c-.293-.293-.293-.768,0-1.061l2.22-2.22-2.22-2.22c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l2.22,2.22,2.22-2.22c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-2.22,2.22,2.22,2.22Z'
      />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      viewBox='0 0 12 12'
      aria-hidden='true'
    >
      <path
        d='m10.25,4.5v4.25c0,1.105-.895,2-2,2h-2.25s-2.25,0-2.25,0c-1.105,0-2-.895-2-2v-4.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <rect
        x='.75'
        y='1.25'
        width='10.5'
        height='3'
        rx='1'
        ry='1'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='5'
        y1='6.75'
        x2='7'
        y2='6.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function HistoryArchiveButton({ className }: { className?: string }) {
  return (
    <button
      type='button'
      className={cn('pm-history-archive-btn', className)}
      aria-label='Archive'
      onClick={(e) => e.stopPropagation()}
    >
      <ArchiveIcon />
    </button>
  )
}

function BuyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-muted-foreground', className)}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 1.875a8.125 8.125 0 1 1 0 16.25 8.125 8.125 0 0 1 0-16.25m0 3.357a.877.877 0 0 0-.876.876v3.014H6.111a.877.877 0 0 0 0 1.75h3.013v3.015a.877.877 0 0 0 1.752 0v-3.014h3.013a.877.877 0 0 0 0-1.75h-3.013V6.107A.877.877 0 0 0 10 5.232'
      />
    </svg>
  )
}

function SellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-muted-foreground', className)}
    >
      <path
        fill='currentColor'
        d='M10 1.875a8.125 8.125 0 1 1 0 16.25 8.125 8.125 0 0 1 0-16.25m0 1.75a6.375 6.375 0 1 0 0 12.75 6.375 6.375 0 0 0 0-12.75m3.25 5.5a.875.875 0 0 1 0 1.75h-6.5a.875.875 0 0 1 0-1.75z'
      />
    </svg>
  )
}

function DepositIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-muted-foreground', className)}
    >
      <path
        fill='currentColor'
        d='M10 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8m-.53-4.22a.75.75 0 0 0 1.061 0l2.5-2.5a.75.75 0 0 0-1.061-1.061l-1.22 1.22V6.752a.75.75 0 0 0-1.5 0v4.69L8.03 10.22a.749.749 0 0 0-1.06 0v-.001a.75.75 0 0 0 0 1.061z'
      />
    </svg>
  )
}

function WithdrawIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-muted-foreground', className)}
    >
      <path
        fill='currentColor'
        d='M10 2c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8m.53 4.22a.75.75 0 0 0-1.061 0l-2.5 2.5A.75.75 0 0 0 8.03 9.78l1.22-1.22v4.688a.75.75 0 0 0 1.5 0v-4.69l1.22 1.221a.749.749 0 0 0 1.06 0v.001a.75.75 0 0 0 0-1.061z'
      />
    </svg>
  )
}

function RebateTypeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className={cn('size-5 shrink-0 text-muted-foreground', className)}
    >
      <path
        fill='currentColor'
        d='M10 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8m-.53-4.22a.75.75 0 0 0 1.061 0l2.5-2.5a.75.75 0 0 0-1.061-1.061l-1.22 1.22V6.752a.75.75 0 0 0-1.5 0v4.69L8.03 10.22a.749.749 0 0 0-1.06 0v-.001a.75.75 0 0 0 0 1.061z'
      />
    </svg>
  )
}

function RebateBrandIcon({ size = 22 }: { size?: 22 | 24 }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 18 18'
      aria-hidden='true'
      className='text-pm-blue'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9 1C4.58168 1 1 4.58179 1 9C1 13.4182 4.58168 17 9 17C13.4183 17 17 13.4182 17 9C17 4.58179 13.4183 1 9 1ZM9.7499 5.2499C9.7499 4.83569 9.41411 4.4999 8.9999 4.4999C8.58569 4.4999 8.2499 4.83569 8.2499 5.2499V5.50371C7.13452 5.56836 6.25 6.49332 6.25 7.6249C6.25 8.79813 7.201 9.7501 8.3748 9.7501H9.6251C9.97019 9.7501 10.2499 10.0298 10.2499 10.3749C10.2499 10.7201 9.97012 10.9998 9.6251 10.9998H7.2499C6.83569 10.9998 6.4999 11.3356 6.4999 11.7498C6.4999 12.164 6.83569 12.4998 7.2499 12.4998H8.2499V12.7499C8.2499 13.1641 8.58569 13.4999 8.9999 13.4999C9.41411 13.4999 9.7499 13.1641 9.7499 12.7499V12.4962C10.8654 12.4316 11.7499 11.5065 11.7499 10.3749C11.7499 9.20139 10.7986 8.2501 9.6251 8.2501H8.3748C8.03 8.2501 7.75 7.97027 7.75 7.6249C7.75 7.27981 8.02971 7.0001 8.3748 7.0001H10.75C11.1642 7.0001 11.5 6.66431 11.5 6.2501C11.5 5.83589 11.1642 5.5001 10.75 5.5001H9.7499V5.2499Z'
        fill='currentColor'
      />
    </svg>
  )
}

function RebateBrandBox({ size }: { size: 44 | 48 }) {
  const iconSize = size === 48 ? 24 : 22

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-sm bg-pm-blue/10',
        size === 48 ? 'size-12' : 'size-11'
      )}
    >
      <RebateBrandIcon size={iconSize} />
    </div>
  )
}

function FundingBrandBox({ size }: { size: 44 | 48 }) {
  return <RebateBrandBox size={size} />
}

function fundingTitle(activity: Activity): string {
  if (activity.type === 'DEPOSIT') return 'Deposit'
  return 'Withdrawal'
}

function fundingDetailLabel(activity: Activity): string {
  if (activity.type === 'DEPOSIT') return 'Deposited funds'
  return 'Withdrew funds'
}

function ExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      viewBox='0 0 12 12'
      aria-hidden='true'
      className={cn(
        'ml-1 text-muted-foreground transition-transform ease-[cubic-bezier(0.77,0,0.175,1)]',
        expanded && 'rotate-180'
      )}
    >
      <polyline
        points='1.75 4.25 6 8.5 10.25 4.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function ActivityTypeIcon({ activity }: { activity: Activity }) {
  if (isLossActivity(activity)) {
    return <LossIcon />
  }

  if (isRebateActivity(activity)) {
    return <RebateTypeIcon />
  }

  if (activity.type === 'DEPOSIT') {
    return <DepositIcon />
  }

  if (activity.type === 'WITHDRAWAL') {
    return <WithdrawIcon />
  }

  if (activity.type === 'REDEEM') {
    return <RedeemIcon />
  }

  return activity.side === 'BUY' ? <BuyIcon /> : <SellIcon />
}

function tradeMobileSubtitle(activity: Activity): string {
  const side = activity.side === 'BUY' ? 'Buy' : 'Sell'
  const shares = Math.round(activity.size)
  const outcome = activity.outcome || ''
  return `${side} ${shares} ${outcome} at ${formatCents(activity.price)}`
}

function lossMobileSubtitle(activity: Activity): string {
  const shares = Math.round(activity.size)
  const outcome = activity.outcome || ''
  return `Loss ${shares} ${outcome} at ${formatCents(activity.price)}`
}

function HistoryShareButton({ className }: { className?: string }) {
  return (
    <button
      type='button'
      className={cn('pm-history-action-btn', className)}
      aria-label='Share'
      onClick={(e) => e.stopPropagation()}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='12'
        height='12'
        viewBox='0 0 12 12'
        aria-hidden='true'
      >
        <line
          x1='7.268'
          y1='4.732'
          x2='10.573'
          y2='1.427'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.5'
        />
        <path
          d='m10.75,7.5v1.25c0,1.105-.895,2-2,2H3.25c-1.105,0-2-.895-2-2V3.25c0-1.105.895-2,2-2h1.25'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.5'
        />
        <polyline
          points='10.75 5 10.75 1.25 7 1.25'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.5'
        />
      </svg>
    </button>
  )
}

function HistoryExpandActions() {
  return (
    <div className='flex items-center gap-2'>
      <button type='button' className='pm-history-action-btn px-3' onClick={(e) => e.stopPropagation()}>
        View
      </button>
      <HistoryShareButton />
    </div>
  )
}

function RebateMarketCell({ activity }: { activity: Activity }) {
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <RebateBrandBox size={44} />
      <p className='truncate text-sm font-medium text-foreground'>
        {rebateTitle(activity)}
      </p>
    </div>
  )
}

function FundingMarketCell({ activity }: { activity: Activity }) {
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <FundingBrandBox size={44} />
      <p className='truncate text-sm font-medium text-foreground'>
        {fundingTitle(activity)}
      </p>
    </div>
  )
}

function ActivityMarketIcon({
  activity,
  size,
}: {
  activity: Activity
  size: 44 | 48
}) {
  if (activity.icon) {
    return (
      <div
        className='relative shrink-0 overflow-hidden rounded-sm'
        style={{ height: size, width: size, minWidth: size }}
      >
        <img
          src={activity.icon}
          alt={`icon for ${activity.title}`}
          className='absolute inset-0 size-full object-cover'
        />
      </div>
    )
  }

  return (
    <div
      className='shrink-0 rounded-sm bg-secondary'
      style={{ height: size, width: size, minWidth: size }}
    />
  )
}

function OutcomeBadge({ outcome, price }: { outcome: string; price: number }) {
  const isUp =
    outcome.toLowerCase() === 'up' || outcome.toLowerCase() === 'yes'
  const label = `${outcome} ${formatCents(price)}`

  return (
    <div
      className={cn(
        'inline-flex w-fit items-center rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-semibold transition-colors',
        isUp ? 'bg-pm-green/15 text-pm-green' : 'bg-pm-red/15 text-pm-red'
      )}
    >
      {label}
    </div>
  )
}

function HistoryMarketCell({ activity }: { activity: Activity }) {
  if (!activity.title) {
    return <span className='text-sm text-muted-foreground'>—</span>
  }

  const showTradeMeta = activity.type === 'TRADE' || isLossActivity(activity)

  return (
    <div className='flex min-w-0 flex-row items-center gap-3'>
      <ActivityMarketIcon activity={activity} size={44} />
      <div className='flex min-w-0 flex-col gap-[2px]'>
        <MarketTitleTooltip
          title={activity.title}
          className='line-clamp-1 cursor-pointer overflow-hidden text-[13px] leading-[21px] font-medium break-all text-ellipsis text-foreground hover:underline'
        />
        {showTradeMeta ? (
          <div className='flex flex-row items-center gap-1'>
            <OutcomeBadge outcome={activity.outcome || '—'} price={activity.price} />
            <span className='text-[12px] leading-[18px] font-medium tracking-[0.15px] text-muted-foreground'>
              {formatShares(activity.size)} shares
            </span>
          </div>
        ) : (
          <div className='flex flex-row items-center gap-1' />
        )}
      </div>
    </div>
  )
}

function HistoryRowDesktop({
  activity,
}: {
  activity: Activity
}) {
  const value = activityValue(activity)
  const isPositive = value > 0
  const isLoss = isLossActivity(activity)
  const isRebate = isRebateActivity(activity)
  const isFunding = isFundingActivity(activity)

  return (
    <div className='hidden w-full items-center gap-2 lg:flex'>
      <div className='flex items-center justify-start' style={{ flex: '1.25 1 0%' }}>
        <div className='flex items-center gap-1.5'>
          <ActivityTypeIcon activity={activity} />
          <span className='text-sm font-medium text-foreground'>
            {activityLabel(activity)}
          </span>
        </div>
      </div>
      <div
        className='flex min-w-0 items-center justify-start'
        style={{ flex: '5 1 0%' }}
      >
        {isRebate ? (
          <RebateMarketCell activity={activity} />
        ) : isFundingActivity(activity) ? (
          <FundingMarketCell activity={activity} />
        ) : (
          <HistoryMarketCell activity={activity} />
        )}
      </div>
      <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
        <span
          className={cn(
            'text-sm font-medium',
            isRebate || (isFunding && activity.type === 'DEPOSIT') || isPositive
              ? 'text-pm-green'
              : 'text-foreground',
            isLoss && 'text-foreground'
          )}
        >
          {isLoss ? '-' : formatUsdSigned(value)}
        </span>
      </div>
      <div className='flex items-center justify-start' style={{ flex: '1 1 0%' }}>
        <span className='text-xs font-medium text-muted-foreground'>
          {formatRelativeTimeShort(activity.timestamp)}
        </span>
      </div>
      <div className='flex items-center justify-end' style={{ flex: '1 1 0%' }}>
        {isLoss ? <HistoryArchiveButton /> : null}
      </div>
    </div>
  )
}

function HistoryRowMobileRebate({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)
  const value = activityValue(activity)

  return (
    <div className='lg:hidden'>
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle transaction details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <RebateBrandBox size={48} />
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium text-foreground'>{rebateTitle(activity)}</p>
          </div>
        </div>
        <div className='my-auto flex items-center gap-2'>
          <div className='flex flex-col items-end gap-1 text-right'>
            <p className='text-sm font-medium text-pm-green'>{formatUsdSigned(value)}</p>
            <span className='text-xs text-muted-foreground'>
              {formatRelativeTimeShort(activity.timestamp)}
            </span>
          </div>
          <ExpandChevron expanded={expanded} />
        </div>
      </div>
      <div
        aria-hidden={!expanded}
        className={cn('overflow-hidden transition-[height] duration-200', !expanded && 'h-0')}
      >
        {expanded ? (
          <div className='flex items-center justify-between pb-1 pt-3'>
            <div className='flex items-center gap-6'>
              <div className='text-xs text-muted-foreground'>
                {rebateDetailLabel(activity)}
              </div>
            </div>
            <HistoryShareButton />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function HistoryRowMobileFunding({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)
  const value = activityValue(activity)
  const isDeposit = activity.type === 'DEPOSIT'

  return (
    <div className='lg:hidden'>
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle transaction details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <FundingBrandBox size={48} />
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium text-foreground'>{fundingTitle(activity)}</p>
          </div>
        </div>
        <div className='my-auto flex items-center gap-2'>
          <div className='flex flex-col items-end gap-1 text-right'>
            <p
              className={cn(
                'text-sm font-medium',
                isDeposit ? 'text-pm-green' : 'text-foreground'
              )}
            >
              {formatUsdSigned(value)}
            </p>
            <span className='text-xs text-muted-foreground'>
              {formatRelativeTimeShort(activity.timestamp)}
            </span>
          </div>
          <ExpandChevron expanded={expanded} />
        </div>
      </div>
      <div
        aria-hidden={!expanded}
        className={cn('overflow-hidden transition-[height] duration-200', !expanded && 'h-0')}
      >
        {expanded ? (
          <div className='flex items-center justify-between pb-1 pt-3'>
            <div className='text-xs text-muted-foreground'>
              {fundingDetailLabel(activity)}
            </div>
            <HistoryShareButton />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function HistoryRowMobileRedeem({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)
  const value = activityValue(activity)

  return (
    <div className='lg:hidden'>
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle transaction details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <ActivityMarketIcon activity={activity} size={48} />
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col items-start gap-1 text-left'>
              <p className='text-pretty text-sm font-medium text-foreground'>
                {activity.title || '—'}
              </p>
              <span className='text-xs text-muted-foreground'>Redeem </span>
            </div>
          </div>
        </div>
        <div className='my-auto flex items-center gap-2'>
          <div className='flex flex-col items-end gap-1 text-right'>
            <p className='text-sm font-medium text-pm-green'>{formatUsdSigned(value)}</p>
            <div className='flex items-center justify-end gap-1'>
              <RedeemIconFilled />
              <span className='text-xs text-pm-green'>Redeemed</span>
            </div>
          </div>
          <ExpandChevron expanded={expanded} />
        </div>
      </div>
      <div
        aria-hidden={!expanded}
        className={cn('overflow-hidden transition-[height] duration-200', !expanded && 'h-0')}
      >
        {expanded ? (
          <div className='flex items-center justify-between pb-1 pt-3'>
            <div className='text-xs text-muted-foreground'>Position closed</div>
            <HistoryExpandActions />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function HistoryRowMobileTrade({
  activity,
}: {
  activity: Activity
}) {
  const [expanded, setExpanded] = useState(false)
  const value = activityValue(activity)
  const isPositive = value > 0

  return (
    <div className='lg:hidden'>
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle transaction details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <ActivityMarketIcon activity={activity} size={48} />
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col items-start gap-1 text-left'>
              <p className='text-pretty text-sm font-medium text-foreground'>
                {activity.title || '—'}
              </p>
              <span className='text-xs text-muted-foreground'>
                {tradeMobileSubtitle(activity)}
              </span>
            </div>
          </div>
        </div>
        <div className='my-auto flex items-center gap-2'>
          <div className='flex flex-col items-end gap-1 text-right'>
            <p
              className={cn(
                'text-sm font-medium',
                isPositive ? 'text-pm-green' : 'text-foreground'
              )}
            >
              {formatUsdSigned(value)}
            </p>
            <span className='text-xs text-muted-foreground'>
              {formatRelativeTimeShort(activity.timestamp)}
            </span>
          </div>
          <ExpandChevron expanded={expanded} />
        </div>
      </div>
      <div
        aria-hidden={!expanded}
        className={cn('overflow-hidden transition-[height] duration-200', !expanded && 'h-0')}
      >
        {expanded ? (
          <div className='flex items-center justify-between pb-1 pt-3'>
            <div className='flex items-center gap-6'>
              <div>
                <p className='text-[11px] tracking-wider text-muted-foreground uppercase'>AVG</p>
                <p className='text-sm font-medium'>{formatCents(activity.price)}</p>
              </div>
              <div>
                <p className='text-[11px] tracking-wider text-muted-foreground uppercase'>
                  Shares
                </p>
                <p className='text-sm font-medium'>{Math.round(activity.size)}</p>
              </div>
            </div>
            <HistoryExpandActions />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function HistoryRowMobileLoss({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='lg:hidden'>
      <div
        className='flex cursor-pointer items-start justify-between gap-3'
        role='button'
        tabIndex={0}
        aria-expanded={expanded}
        aria-label='Toggle transaction details'
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
      >
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <ActivityMarketIcon activity={activity} size={48} />
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col items-start gap-1 text-left'>
              <p className='text-pretty text-sm font-medium text-foreground'>
                {activity.title || '—'}
              </p>
              <span className='text-xs text-muted-foreground'>
                {lossMobileSubtitle(activity)}
              </span>
            </div>
          </div>
        </div>
        <div className='my-auto flex items-center gap-2'>
          <div className='flex flex-col items-end gap-1 text-right'>
            <div className='flex items-center justify-end gap-1'>
              <LossIconFilled />
              <span className='text-xs text-red-500'>Lost</span>
            </div>
          </div>
          <ExpandChevron expanded={expanded} />
        </div>
      </div>
      <div
        aria-hidden={!expanded}
        className={cn('overflow-hidden transition-[height] duration-200', !expanded && 'h-0')}
      >
        {expanded ? (
          <div className='flex items-center justify-between pb-1 pt-3'>
            <div className='text-xs text-muted-foreground'>Position lost</div>
            <HistoryArchiveButton />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function HistoryRowMobile({
  activity,
}: {
  activity: Activity
}) {
  if (isRebateActivity(activity)) {
    return <HistoryRowMobileRebate activity={activity} />
  }

  if (isFundingActivity(activity)) {
    return <HistoryRowMobileFunding activity={activity} />
  }

  if (isLossActivity(activity)) {
    return <HistoryRowMobileLoss activity={activity} />
  }

  if (activity.type === 'REDEEM') {
    return <HistoryRowMobileRedeem activity={activity} />
  }

  return <HistoryRowMobileTrade activity={activity} />
}

function HistoryRow({
  activity,
  index,
}: {
  activity: Activity
  index: number
}) {
  const alternate = index % 2 === 0

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 lg:min-h-[64px] lg:items-center',
        alternate && 'pm-position-row-alt'
      )}
    >
      <HistoryRowDesktop activity={activity} />
      <HistoryRowMobile activity={activity} />
    </div>
  )
}

function useHistoryList() {
  const wallet = useWalletAddress()
  const { data: activities, isLoading: activityLoading } = useFullActivity()
  const { data: closedPositions, isLoading: closedLoading } = useClosedPositions()
  const { data: fundingActivities, isLoading: fundingLoading } = useFundingActivity()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityFilter>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST')
  const [visibleCount, setVisibleCount] = useState(10)

  const mergedActivities = useMemo(() => {
    if (!activities) return []
    const withLosses = mergeHistoryActivities(
      activities,
      closedPositions ?? [],
      wallet
    )
    return mergeFundingActivities(withLosses, fundingActivities ?? [])
  }, [activities, closedPositions, fundingActivities, wallet])

  const filtered = useMemo(() => {
    if (!mergedActivities.length) return []
    let result = [...mergedActivities]
    if (typeFilter !== 'ALL') {
      result = result.filter((activity) => matchesActivityFilter(activity, typeFilter))
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((a) => {
        const title =
          a.title ||
          (isRebateActivity(a) ? rebateTitle(a) : '') ||
          (isFundingActivity(a) ? fundingTitle(a) : '')
        return title.toLowerCase().includes(q)
      })
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'OLDEST':
          return a.timestamp - b.timestamp
        case 'VALUE':
          return Math.abs(activityValue(b)) - Math.abs(activityValue(a))
        default:
          return b.timestamp - a.timestamp
      }
    })
    return result
  }, [mergedActivities, search, typeFilter, sortBy])

  const visible = filtered.slice(0, visibleCount)

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy,
    visible,
    filtered,
    visibleCount,
    setVisibleCount,
    isLoading: activityLoading || closedLoading || fundingLoading,
  }
}

function HistoryListView({
  visible,
  filtered,
  visibleCount,
  setVisibleCount,
  isLoading,
}: ReturnType<typeof useHistoryList>) {
  return (
    <div className='relative flex flex-col'>
      <div className='relative bg-background'>
        <HistoryTableHeader />
        <div className='w-full'>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='px-4 py-3'>
                <Skeleton className='h-16 w-full bg-white/5' />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              No activity found.
            </div>
          ) : (
            visible.map((activity, index) => (
              <HistoryRow
                key={`${activity.transactionHash}-${activity.timestamp}`}
                activity={activity}
                index={index}
              />
            ))
          )}
        </div>
        {filtered.length > visibleCount ? (
          <div className='flex w-full justify-center py-4'>
            <button
              type='button'
              onClick={() => setVisibleCount((c) => c + 10)}
              className='pm-show-more-btn'
            >
              Show more activity
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function HistoryPanel() {
  const list = useHistoryList()

  return (
    <>
      <PortfolioToolbarScroll className='mb-4 lg:hidden'>
        <HistoryToolbar {...list} />
      </PortfolioToolbarScroll>
      <HistoryListView {...list} />
    </>
  )
}

type HistoryTabProps = {
  activeTab: PortfolioTab
  onTabChange: (tab: PortfolioTab) => void
}

export function HistoryTab({ activeTab, onTabChange }: HistoryTabProps) {
  const list = useHistoryList()

  return (
    <PortfolioTabShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      toolbarLayout='scroll'
      toolbar={<HistoryToolbar {...list} />}
    >
      <HistoryListView {...list} />
    </PortfolioTabShell>
  )
}
