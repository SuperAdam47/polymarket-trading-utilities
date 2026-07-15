import { createFileRoute, notFound } from '@tanstack/react-router'
import { PolymarketLayout } from '@/features/polymarket/layout/polymarket-layout'
import { WalletGuard } from '@/features/polymarket/components/wallet-guard'
import { ProfilePage } from '@/features/polymarket/profile/profile-page'
import { ProfileAddressProvider } from '@/features/polymarket/profile/profile-address-context'
import { resolveProfileSlug } from '@/lib/polymarket/profile-route'

export const Route = createFileRoute('/$slug')({
  loader: async ({ params }) => {
    const address = await resolveProfileSlug(params.slug)
    if (!address) throw notFound()
    return { address }
  },
  component: ProfileSlugRoute,
})

function ProfileSlugRoute() {
  const { address } = Route.useLoaderData()

  return (
    <WalletGuard>
      <PolymarketLayout>
        <ProfileAddressProvider address={address}>
          <ProfilePage />
        </ProfileAddressProvider>
      </PolymarketLayout>
    </WalletGuard>
  )
}
