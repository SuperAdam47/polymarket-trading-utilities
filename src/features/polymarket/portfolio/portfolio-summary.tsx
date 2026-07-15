import { useCopyDeveloperAddress } from '@/features/polymarket/components/developer-address-copied-dialog'
import {
  cardDepositButtonClassName,
  cardWithdrawButtonClassName,
} from '@/features/polymarket/components/deposit-button-styles'
import {
  PortfolioCopyIcon,
  PortfolioDepositIcon,
  PortfolioHideBalanceIcon,
  PortfolioWithdrawIcon,
} from '@/features/polymarket/components/portfolio-copy-icon'
import { formatPercent, formatUsd, formatUsdSigned } from '@/lib/polymarket/format'
import { getWalletAddress } from '@/lib/polymarket/config'
import { usePortfolioSummary } from '@/features/polymarket/hooks/use-polymarket-data'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function PortfolioSummary() {
  const { data, isLoading } = usePortfolioSummary()
  const address = getWalletAddress()
  const { copyAddress, dialog } = useCopyDeveloperAddress(address)

  if (isLoading) {
    return (
      <div className='flex h-full flex-col justify-between rounded-xl border border-white/[0.06] bg-card p-4 md:min-h-[200px]'>
        <Skeleton className='h-5 w-24 bg-white/5' />
        <Skeleton className='mt-4 h-9 w-40 bg-white/5' />
        <Skeleton className='mt-2 h-4 w-32 bg-white/5' />
        <div className='mt-4 flex gap-2'>
          <Skeleton className='h-12 flex-1 bg-white/5' />
          <Skeleton className='h-12 flex-1 bg-white/5' />
        </div>
      </div>
    )
  }

  const dailyPnl = data?.dailyPnl ?? 0
  const isPositive = dailyPnl >= 0

  return (
    <>
      {dialog}
      <div className='flex h-full flex-col justify-between rounded-xl border border-white/[0.06] bg-card p-4 md:min-h-[200px]'>
      <div className='flex items-start justify-between'>
        <div className='flex flex-col'>
          <div className='mb-0.5 flex items-center gap-1'>
            <p className='text-sm font-medium text-muted-foreground'>Portfolio</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={copyAddress}
                  className='inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition duration-150 active:scale-[0.97] hover:text-foreground'
                  aria-label='Copy address'
                >
                  <PortfolioCopyIcon className='size-4' />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                sideOffset={6}
                hideArrow
                className='border border-white/10 bg-[#1a1d21] px-2.5 py-1 text-xs font-normal text-white shadow-md'
              >
                Copy address
              </TooltipContent>
            </Tooltip>
          </div>

          <div className='flex items-center gap-x-2.5'>
            <span className='pm-portfolio-amount inline-flex'>
              {formatUsd(data?.portfolioTotal ?? 0)}
            </span>
            <button
              type='button'
              className='cursor-pointer text-muted-foreground hover:text-foreground/70'
              aria-label='Hide balance'
            >
              <PortfolioHideBalanceIcon className='size-[18px]' />
            </button>
          </div>

          <p
            className={cn(
              'mb-2 text-xs font-medium',
              isPositive ? 'text-pm-green' : 'text-pm-red'
            )}
          >
            <span>
              {formatUsdSigned(dailyPnl)} ({formatPercent(data?.dailyPnlPercent ?? 0)})
            </span>
            <span>&nbsp;past day</span>
          </p>
        </div>

        <div className='flex flex-col items-end gap-0.5'>
          <p className='text-xs font-medium text-muted-foreground'>
            Available to trade
          </p>
          <p className='pm-portfolio-amount'>
            {formatUsd(data?.cashBalance ?? 0)}
          </p>
        </div>
      </div>

      <div className='mt-4 flex w-full flex-row gap-2 md:mt-0'>
        <div className='min-w-0 flex-1'>
          <button type='button' className={cardDepositButtonClassName}>
            <PortfolioDepositIcon />
            <span data-slot='label' className='inline-flex shrink-0 items-center gap-1 px-1.5'>
              Deposit
            </span>
          </button>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='w-full'>
            <button type='button' className={cardWithdrawButtonClassName}>
              <PortfolioWithdrawIcon />
              <span data-slot='label' className='inline-flex shrink-0 items-center gap-1 px-1.5'>
                Withdraw
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
