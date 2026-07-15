import { cn } from '@/lib/utils'

type OutcomeBadgeProps = {
  outcome: string
  price: number
  shares?: number
  className?: string
}

export function OutcomeBadge({
  outcome,
  price,
  shares,
  className,
}: OutcomeBadgeProps) {
  const isUp = outcome.toLowerCase() === 'up' || outcome.toLowerCase() === 'yes'
  const cents = `${(price * 100).toFixed(price * 100 >= 10 ? 1 : 1)}¢`

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          isUp
            ? 'bg-pm-green/20 text-pm-green'
            : 'bg-pm-red/20 text-pm-red'
        )}
      >
        {outcome} {cents}
      </span>
      {shares !== undefined && (
        <span className='text-muted-foreground'>
          {shares.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{' '}
          shares
        </span>
      )}
    </div>
  )
}
