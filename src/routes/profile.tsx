import { createFileRoute, redirect } from '@tanstack/react-router'
import { getWalletAddress } from '@/lib/polymarket/config'
import { fetchUsername } from '@/lib/polymarket/endpoints'
import { buildProfileSlug } from '@/lib/polymarket/profile-route'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const address = getWalletAddress()
    const username = await fetchUsername(address)

    throw redirect({
      to: '/$slug',
      params: { slug: buildProfileSlug({ username, address }) },
    })
  },
})
