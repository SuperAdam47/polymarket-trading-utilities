import { AlertCircle } from 'lucide-react'
import { tryGetWalletAddress } from '@/lib/polymarket/config'

type WalletGuardProps = {
  children: React.ReactNode
}

export function WalletGuard({ children }: WalletGuardProps) {
  const address = tryGetWalletAddress()

  if (!address) {
    return (
      <div className='flex min-h-svh items-center justify-center bg-background p-4'>
        <div className='max-w-md rounded-xl border border-border bg-card p-8 text-center'>
          <AlertCircle className='mx-auto size-12 text-pm-red' />
          <h1 className='mt-4 text-xl font-semibold text-foreground'>
            Wallet address required
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Set{' '}
            <code className='rounded bg-secondary px-1.5 py-0.5 text-xs'>
              VITE_POLYMARKET_WALLET_ADDRESS
            </code>{' '}
            in your <code className='rounded bg-secondary px-1.5 py-0.5 text-xs'>.env</code>{' '}
            file to a valid 0x-prefixed Polygon wallet address.
          </p>
        </div>
      </div>
    )
  }

  return children
}
