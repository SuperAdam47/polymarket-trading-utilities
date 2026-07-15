import { cn } from '@/lib/utils'

export function TrendingNavIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      className={cn('size-[18px] shrink-0', className)}
      aria-hidden='true'
    >
      <path
        d='M1.75,12.25l3.646-3.646c.195-.195,.512-.195,.707,0l3.293,3.293c.195,.195,.512,.195,.707,0l6.146-6.146'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='11.25 5.75 16.25 5.75 16.25 10.75'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

export function CombosNavIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={cn('size-[18px] shrink-0', className)}
      role='img'
      aria-label='Combos'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M10.6504 2.02168C11.2573 1.91401 12.009 2.25156 13.5117 2.92695L16.1113 4.09589C16.795 4.40315 17.1371 4.55658 17.3877 4.79804C17.6092 5.01149 17.7789 5.27317 17.8828 5.56269C18.0002 5.89009 18 6.26485 18 7.01386V12.9865C18 13.736 18.0003 14.1111 17.8828 14.4387C17.7789 14.7281 17.6091 14.9899 17.3877 15.2033C17.1372 15.4446 16.7947 15.5983 16.1113 15.9055L13.5117 17.0734C12.0089 17.7488 11.2573 18.0874 10.6504 17.9797C10.1201 17.8856 9.64989 17.5811 9.34668 17.1359C8.99979 16.6265 9 15.8026 9 14.1555V5.84589C9 4.1983 8.99966 3.37392 9.34668 2.86445C9.64987 2.41941 10.1202 2.11581 10.6504 2.02168ZM7.5 16.5734C6.39543 16.5734 5.5 15.678 5.5 14.5734V5.42695C5.5002 4.32255 6.39555 3.42695 7.5 3.42695V16.5734ZM4 14.551C2.89543 14.551 2 13.6555 2 12.551V7.44941C2.00022 6.34503 2.89556 5.44941 4 5.44941V14.551Z'
        fill='url(#pm-combos-gradient)'
      />
      <defs>
        <linearGradient
          id='pm-combos-gradient'
          x1='2.02418'
          y1='10.0849'
          x2='18.018'
          y2='10.4399'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0.370192' stopColor='#808EEF' />
          <stop offset='1' stopColor='#C96BEF' />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function WorldCupNavIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn('pm-world-cup-nav-icon', className)}
      aria-hidden='true'
    />
  )
}
