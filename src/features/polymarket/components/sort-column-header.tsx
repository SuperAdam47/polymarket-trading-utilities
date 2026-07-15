import { cn } from '@/lib/utils'

function SortChevrons({ active }: { active?: 'asc' | 'desc' | false }) {
  return (
    <div className='flex flex-col -space-y-[5px]'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='10'
        height='10'
        viewBox='0 0 12 12'
        className={cn(
          'rotate-180',
          active === 'asc' ? 'text-foreground' : 'text-muted-foreground/70'
        )}
        aria-hidden='true'
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
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='10'
        height='10'
        viewBox='0 0 12 12'
        className={cn(
          active === 'desc' ? 'text-foreground' : 'text-muted-foreground/70'
        )}
        aria-hidden='true'
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
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='10'
      height='10'
      viewBox='0 0 12 12'
      aria-hidden='true'
    >
      <line
        x1='1'
        y1='6'
        x2='10.75'
        y2='6'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='7.75 9.25 11 6 7.75 2.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='10'
      height='10'
      viewBox='0 0 12 12'
      aria-hidden='true'
    >
      <circle
        cx='6'
        cy='6'
        r='5.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <circle cx='6' cy='3.125' r='.875' fill='currentColor' strokeWidth='0' />
      <line
        x1='6'
        y1='8.5'
        x2='6'
        y2='5.5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

type SortColumnHeaderProps = {
  label: string
  flex?: string
  sortActive?: 'asc' | 'desc' | false
  onClick?: () => void
  variant?: 'default' | 'avg-now'
}

export function SortColumnHeader({
  label,
  flex = '1 1 0%',
  sortActive = false,
  onClick,
  variant = 'default',
}: SortColumnHeaderProps) {
  return (
    <div
      className='flex items-center justify-start'
      style={{ flex }}
    >
      <button
        type='button'
        onClick={onClick}
        className='flex cursor-pointer flex-row items-center gap-x-1 text-muted-foreground transition-colors duration-200 hover:text-foreground/80'
      >
        {variant === 'avg-now' ? (
          <div className='flex cursor-pointer flex-row items-center gap-x-1'>
            <span className='inline-flex items-center gap-1 text-[11px] leading-[15px] font-medium tracking-wider whitespace-nowrap uppercase'>
              <span>AVG</span>
              <ArrowRightIcon />
              <span>NOW</span>
            </span>
            <InfoIcon />
          </div>
        ) : (
          <span className='inline-flex items-center gap-1 text-[11px] leading-[15px] font-medium tracking-wider whitespace-nowrap uppercase'>
            {label}
          </span>
        )}
        <SortChevrons active={sortActive} />
      </button>
    </div>
  )
}

export function ProfilePositionsTableHeader() {
  return (
    <div className='sticky top-0 z-[1] hidden items-center gap-2 bg-background px-4 py-4 lg:flex'>
      <SortColumnHeader label='Market' flex='17.65 1 0%' />
      <SortColumnHeader label='Avg' flex='1.5 1 0%' />
      <div className='flex items-center justify-start' style={{ flex: '1.5 1 0%' }}>
        <span className='text-[11px] leading-[15px] font-medium tracking-wider text-muted-foreground uppercase'>
          Current
        </span>
      </div>
      <div className='flex items-center justify-end' style={{ flex: '4 1 0%' }}>
        <SortColumnHeader label='Value' flex='4 1 0%' sortActive='desc' />
      </div>
      <div
        className='flex min-w-[3rem] items-center justify-start'
        style={{ flex: '1.5 1 0%' }}
      />
    </div>
  )
}

export function PositionsTableHeader() {
  return (
    <div className='sticky top-0 z-[1] hidden items-center gap-2 bg-background px-4 py-4 lg:flex'>
      <SortColumnHeader label='Market' flex='5 1 0%' />
      <SortColumnHeader label='' flex='2 1 0%' variant='avg-now' />
      <SortColumnHeader label='Traded' flex='1.5 1 0%' />
      <SortColumnHeader label='To Win' flex='1.5 1 0%' />
      <SortColumnHeader label='Value' flex='2 1 0%' sortActive='desc' />
      <div className='w-[120px] shrink-0' />
    </div>
  )
}

export function ClosedPositionsTableHeader() {
  return (
    <div className='sticky top-0 z-[1] hidden items-center gap-2 bg-background px-4 py-4 lg:flex'>
      <SortColumnHeader label='Result' flex='2 1 0%' />
      <SortColumnHeader label='Market' flex='13.5 1 0%' />
      <SortColumnHeader label='Cost' flex='3 1 0%' />
      <SortColumnHeader label='Value' flex='4 1 0%' sortActive='desc' />
      <div className='flex items-center justify-end' style={{ flex: '1.5 1 0%' }} />
    </div>
  )
}

export function HistoryTableHeader() {
  return (
    <div className='sticky top-0 z-[1] hidden items-center gap-2 bg-background px-4 py-4 lg:flex'>
      <SortColumnHeader label='Activity' flex='1.25 1 0%' />
      <SortColumnHeader label='Market' flex='5 1 0%' />
      <SortColumnHeader label='Value' flex='1.5 1 0%' sortActive='desc' />
      <SortColumnHeader label='Time' flex='1 1 0%' sortActive='desc' />
      <div className='flex items-center justify-end' style={{ flex: '1 1 0%' }} />
    </div>
  )
}
