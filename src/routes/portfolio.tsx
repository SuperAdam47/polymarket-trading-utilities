import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PolymarketLayout } from '@/features/polymarket/layout/polymarket-layout'
import { WalletGuard } from '@/features/polymarket/components/wallet-guard'
import { PortfolioPage } from '@/features/polymarket/portfolio/portfolio-page'
import type { PortfolioTab } from '@/lib/polymarket/types'

const portfolioSearchSchema = z.object({
  tab: z
    .enum(['positions', 'Open orders', 'history'])
    .catch('positions' as PortfolioTab),
})

export const Route = createFileRoute('/portfolio')({
  validateSearch: portfolioSearchSchema,
  component: PortfolioRoute,
})

function PortfolioRoute() {
  const { tab } = Route.useSearch()

  return (
    <WalletGuard>
      <PolymarketLayout>
        <PortfolioPage tab={tab} />
      </PolymarketLayout>
    </WalletGuard>
  )
}
