import type { ReactNode } from 'react'
import {
  cardDepositButtonClassName,
  cardWithdrawButtonClassName,
  pmGhostButtonClassName,
} from '@/features/polymarket/components/deposit-button-styles'
import {
  PortfolioCopyIcon,
  PortfolioDepositIcon,
  PortfolioWithdrawIcon,
  ProfileEditIcon,
  ProfileShareIcon,
} from '@/features/polymarket/components/portfolio-copy-icon'
import { TakerTierSilverBadge } from '@/features/polymarket/components/taker-tier-silver-badge'
import { UserAvatar } from '@/features/polymarket/components/user-avatar'
import {
  useBiggestWin,
  usePortfolioSummary,
  usePublicProfile,
  useTradedCount,
} from '@/features/polymarket/hooks/use-polymarket-data'
import { getWalletAddress } from '@/lib/polymarket/config'
import { formatJoinedDate, formatUsd } from '@/lib/polymarket/format'
import { Skeleton } from '@/components/ui/skeleton'
import { useCopyDeveloperAddress } from '@/features/polymarket/components/developer-address-copied-dialog'

function ProfileGhostButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button type='button' aria-label={label} onClick={onClick} className={pmGhostButtonClassName}>
      {children}
    </button>
  )
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-col'>
      <p className='text-lg font-medium text-foreground'>{value}</p>
      <p className='text-xs font-medium whitespace-nowrap text-muted-foreground'>{label}</p>
    </div>
  )
}

function CardActionButton({
  className,
  icon,
  label,
}: {
  className: string
  icon: ReactNode
  label: string
}) {
  return (
    <button type='button' className={className}>
      {icon}
      <span data-slot='label' className='inline-flex shrink-0 items-center gap-1 px-1.5'>{label}</span>
    </button>
  )
}

export function ProfileSummaryCard() {
  const address = getWalletAddress()
  const { data: profile, isLoading: profileLoading } = usePublicProfile()
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary()
  const { data: biggestWin, isLoading: winLoading } = useBiggestWin()
  const { data: tradedCount, isLoading: tradedLoading } = useTradedCount()

  const isLoading = profileLoading || summaryLoading || winLoading || tradedLoading
  const username = summary?.username ?? 'User'
  const { copyAddress, dialog } = useCopyDeveloperAddress(address)

  if (isLoading) {
    return (
      <div className='rounded-xl border-0 md:border md:bg-surface-1 md:p-4 md:h-full'>
        <div className='flex flex-col gap-4 md:h-full'>
          <div className='grid w-full grid-cols-[64px_1fr] grid-rows-2 items-center gap-x-3'>
            <Skeleton className='row-span-2 size-16 rounded-full bg-white/5' />
            <Skeleton className='h-8 w-48 bg-white/5' />
            <Skeleton className='h-5 w-36 bg-white/5' />
          </div>
          <div className='mt-auto flex flex-row items-start gap-x-5 md:gap-x-4'>
            <Skeleton className='h-10 w-20 bg-white/5' />
            <Skeleton className='h-10 w-20 bg-white/5' />
            <Skeleton className='h-10 w-20 bg-white/5' />
          </div>
          <div className='mt-3 flex flex-row gap-2'>
            <Skeleton className='h-12 flex-1 rounded-[14px] bg-white/5' />
            <Skeleton className='h-12 flex-1 rounded-[14px] bg-white/5' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {dialog}
      <div className='rounded-xl border-0 md:border md:bg-surface-1 md:p-4 md:h-full'>
      <div className='flex flex-col gap-4 md:h-full'>
        <div className='grid w-full grid-cols-[64px_1fr] grid-rows-2 items-center gap-x-3'>
          <div className='relative row-span-2 size-16'>
            <UserAvatar imageUrl={profile?.profileImage} />
            <TakerTierSilverBadge />
          </div>

          <div className='flex w-full items-center justify-between overflow-hidden'>
            <div className='flex min-w-0 flex-1 items-center gap-2 pr-2'>
              <p className='min-w-0 max-w-full truncate text-2xl font-semibold text-foreground'>
                {username}
              </p>
            </div>
            <div className='flex shrink-0 min-w-fit items-center gap-1'>
              <div className='flex items-center gap-2'>
                <div className='inline-flex'>
                  <ProfileGhostButton label='Copy address' onClick={copyAddress}>
                    <PortfolioCopyIcon className='size-[18px] md:hidden' />
                    <PortfolioCopyIcon className='hidden size-4 md:inline' />
                  </ProfileGhostButton>
                </div>
              </div>
              <ProfileGhostButton label='Edit profile'>
                <ProfileEditIcon className='size-[18px] md:hidden' />
                <ProfileEditIcon className='hidden size-4 md:inline' />
              </ProfileGhostButton>
              <ProfileGhostButton label='Share profile'>
                <ProfileShareIcon className='size-[18px] md:hidden' />
                <ProfileShareIcon className='hidden size-4 md:inline' />
              </ProfileGhostButton>
            </div>
          </div>

          <div className='flex min-h-[20px] flex-wrap items-center gap-x-2 text-muted-foreground'>
            <span className='text-sm whitespace-nowrap'>
              {formatJoinedDate(profile?.createdAt)}
            </span>
            <span className='text-sm'>·</span>
            <span className='text-sm whitespace-nowrap'>40 views</span>
          </div>
        </div>

        <div className='mt-auto flex flex-row items-start gap-x-5 md:gap-x-4'>
          <ProfileStat value={formatUsd(summary?.positionsValue ?? 0)} label='Positions Value' />
          <div className='h-8 w-px self-center bg-border' />
          <ProfileStat value={formatUsd(biggestWin ?? 0)} label='Biggest Win' />
          <div className='h-8 w-px self-center bg-border' />
          <ProfileStat value={(tradedCount ?? 0).toLocaleString()} label='Predictions' />
        </div>

        <div className='mt-3 flex flex-row gap-2'>
          <span className='min-w-0 flex-1'>
            <CardActionButton
              className={cardDepositButtonClassName}
              icon={<PortfolioDepositIcon />}
              label='Deposit'
            />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='w-full'>
              <CardActionButton
                className={cardWithdrawButtonClassName}
                icon={<PortfolioWithdrawIcon />}
                label='Withdraw'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
