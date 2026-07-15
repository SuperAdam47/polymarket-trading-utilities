import { pmPrimaryButtonMdClassName } from '@/features/polymarket/components/deposit-button-styles'
import { formatUsd } from '@/lib/polymarket/format'
import { useRedeemablePositions } from '@/features/polymarket/hooks/use-polymarket-data'

function RedeemTicketIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
      className='size-[18px] shrink-0'
    >
      <circle cx='9' cy='9' r='2.5' fill='currentColor' />
      <path
        d='M14.25,3H3.75c-1.517,0-2.75,1.233-2.75,2.75v6.5c0,1.517,1.233,2.75,2.75,2.75H14.25c1.517,0,2.75-1.233,2.75-2.75V5.75c0-1.517-1.233-2.75-2.75-2.75Zm-1.608,10.5H5.358c-.364-1.399-1.459-2.494-2.858-2.858v-3.284c1.399-.364,2.494-1.459,2.858-2.858h7.284c.364,1.399,1.459,2.494,2.858,2.858v3.284c-1.399,.364-2.494,1.459-2.858,2.858Z'
        fill='currentColor'
      />
    </svg>
  )
}

function RedemptionPositionIcons({ icons }: { icons: string[] }) {
  if (icons.length === 0) return null

  const [first, second] = icons

  return (
    <div
      className='relative mx-2 mr-2 flex h-12 items-center justify-center'
      style={{ width: '4rem' }}
    >
      {first ? (
        <div
          className='absolute h-11 w-11 overflow-hidden rounded-lg border-2 border-white bg-white shadow-sm'
          style={{
            top: '1px',
            left: second ? '-12px' : '50%',
            zIndex: 1,
            transform: second ? 'rotate(-13deg)' : 'translateX(-50%)',
          }}
        >
          <img
            src={first}
            alt='Position'
            className='h-full w-full object-cover'
          />
        </div>
      ) : null}
      {second ? (
        <div
          className='absolute h-11 w-11 overflow-hidden rounded-lg border-2 border-white bg-white shadow-sm'
          style={{
            top: '2px',
            right: 0,
            zIndex: 2,
            transform: 'rotate(19deg)',
          }}
        >
          <img
            src={second}
            alt='Position'
            className='h-full w-full object-cover'
          />
        </div>
      ) : null}
    </div>
  )
}

export function RedemptionBanner() {
  const { data: redeemable } = useRedeemablePositions()

  if (!redeemable?.length) return null

  const totalWon = redeemable.reduce(
    (sum, position) =>
      sum + (position.currentValue > 0 ? position.currentValue : position.size),
    0
  )

  if (totalWon <= 0) return null

  const icons = redeemable
    .map((position) => position.icon)
    .filter(Boolean)
    .slice(0, 2)

  return (
    <div style={{ opacity: 1, height: 'auto' }}>
      <div className='flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-4 dark:bg-surface-1'>
        <div className='ml-4 flex items-center gap-6'>
          <RedemptionPositionIcons icons={icons} />
          <div className='flex items-center gap-2'>
            <span className='font-medium text-muted-foreground'>You won</span>
            <span className='text-xl font-semibold text-foreground'>
              {formatUsd(totalWon)}
            </span>
          </div>
        </div>
        <button type='button' className={pmPrimaryButtonMdClassName}>
          <RedeemTicketIcon />
          Redeem
        </button>
      </div>
    </div>
  )
}
