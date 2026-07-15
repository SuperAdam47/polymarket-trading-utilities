import { truncateTitle } from '@/lib/polymarket/format'

type MarketCellProps = {
  icon?: string
  title: string
  outcome: string
  price: number
  shares?: number
}

export function MarketCell({ icon, title, outcome, price, shares }: MarketCellProps) {
  const isUp = outcome.toLowerCase() === 'up' || outcome.toLowerCase() === 'yes'
  const cents = `${(price * 100).toFixed(1)}¢`

  return (
    <div className='flex items-start gap-3'>
      {icon ? (
        <img
          src={icon}
          alt=''
          className='mt-0.5 size-8 shrink-0 rounded-full object-cover'
        />
      ) : (
        <div className='mt-0.5 size-8 shrink-0 rounded-full bg-secondary' />
      )}
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium text-foreground'>
          {truncateTitle(title, 52)}
        </p>
        <div className='mt-1 flex items-center gap-2'>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isUp
                ? 'bg-pm-green/20 text-pm-green'
                : 'bg-pm-red/20 text-pm-red'
            }`}
          >
            {outcome} {cents}
          </span>
          {shares !== undefined && (
            <span className='text-xs text-muted-foreground'>
              {shares.toLocaleString('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{' '}
              shares
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
