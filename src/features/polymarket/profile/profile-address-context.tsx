import { createContext, useContext } from 'react'
import type { WalletAddress } from '@/lib/polymarket/config'

const ProfileAddressContext = createContext<WalletAddress | null>(null)

export function ProfileAddressProvider({
  address,
  children,
}: {
  address: WalletAddress
  children: React.ReactNode
}) {
  return (
    <ProfileAddressContext.Provider value={address}>
      {children}
    </ProfileAddressContext.Provider>
  )
}

export function useOptionalProfileAddress(): WalletAddress | null {
  return useContext(ProfileAddressContext)
}
