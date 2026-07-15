import { cn } from '@/lib/utils'

type PolymarketLogoProps = {
  className?: string
}

export function PolymarketLogo({ className }: PolymarketLogoProps) {
  return (
    <img
      src='/images/polymarket-logo.svg'
      alt='Polymarket'
      width={911}
      height={168}
      className={cn('h-[26px] w-auto max-[400px]:w-auto', className)}
    />
  )
}
