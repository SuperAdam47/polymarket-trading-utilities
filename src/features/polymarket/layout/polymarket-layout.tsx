import { PolymarketHeader } from './header'
import { polymarketContentContainerClassName } from './container'

type PolymarketLayoutProps = {
  children: React.ReactNode
}

export function PolymarketLayout({ children }: PolymarketLayoutProps) {
  return (
    <div className='pm-shell min-h-svh bg-background text-foreground'>
      <PolymarketHeader />
      <main className='w-full pb-8'>
        <div className={polymarketContentContainerClassName}>{children}</div>
      </main>
    </div>
  )
}
