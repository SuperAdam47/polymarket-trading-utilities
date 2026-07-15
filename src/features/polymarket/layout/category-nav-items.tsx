import type { ReactNode } from 'react'
import {
  CombosNavIcon,
  TrendingNavIcon,
  WorldCupNavIcon,
} from '@/features/polymarket/components/category-nav-icons'

export type CategoryNavItem =
  | { type: 'separator' }
  | {
      type: 'item'
      label: string
      icon?: ReactNode
      variant?: 'default' | 'world-cup'
    }

export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    type: 'item',
    label: 'Trending',
    icon: <TrendingNavIcon />,
  },
  {
    type: 'item',
    label: 'World Cup',
    icon: <WorldCupNavIcon />,
    variant: 'world-cup',
  },
  {
    type: 'item',
    label: 'Combos',
    icon: <CombosNavIcon />,
  },
  { type: 'item', label: 'Breaking' },
  { type: 'separator' },
  { type: 'item', label: 'Politics' },
  { type: 'item', label: 'Sports' },
  { type: 'item', label: 'Crypto' },
  { type: 'item', label: 'Esports' },
  { type: 'item', label: 'Iran' },
  { type: 'item', label: 'Finance' },
  { type: 'item', label: 'Geopolitics' },
  { type: 'item', label: 'Tech' },
  { type: 'item', label: 'Culture' },
  { type: 'item', label: 'Economy' },
  { type: 'item', label: 'Weather' },
  { type: 'item', label: 'Mentions' },
  { type: 'item', label: 'Elections' },
  { type: 'item', label: 'Art' },
]
