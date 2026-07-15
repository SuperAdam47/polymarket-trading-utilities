import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronDownIcon,
  MenuAddressCopyIcon,
  MenuApisIcon,
  MenuBuildersIcon,
  MenuChevronIcon,
  MenuDarkModeIcon,
  MenuLeaderboardIcon,
  MenuReferIcon,
  MenuRewardsIcon,
  MenuSettingsIcon,
} from '@/features/polymarket/layout/user-menu-icons'
import { UserAvatar } from '@/features/polymarket/components/user-avatar'
import { useCopyDeveloperAddress } from '@/features/polymarket/components/developer-address-copied-dialog'
import {
  usePortfolioSummary,
  usePublicProfile,
} from '@/features/polymarket/hooks/use-polymarket-data'
import { getWalletAddress } from '@/lib/polymarket/config'
import { buildProfileSlug } from '@/lib/polymarket/profile-route'
import { formatShortAddress } from '@/lib/polymarket/format'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

type PolymarketUserMenuProps = {
  className?: string
  showChevron?: boolean
}

const navLinkClass =
  'flex h-10 items-center rounded-md px-3 text-sm font-medium text-foreground no-underline outline-none select-none pm-user-menu-hover'

const textLinkClass =
  'flex h-10 w-full items-center rounded-md px-3 text-sm font-medium text-muted-foreground no-underline outline-none select-none pm-user-menu-hover'

function MenuNavLink({
  href,
  icon,
  label,
  external,
}: {
  href: string
  icon: ReactNode
  label: string
  external?: boolean
}) {
  return (
    <li className='w-full'>
      <a
        href={href}
        className={navLinkClass}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : undefined)}
      >
        <div className='flex items-center gap-2 font-medium'>
          {icon}
          <span>{label}</span>
        </div>
      </a>
    </li>
  )
}

function MenuTextLink({
  href,
  label,
  external,
  onClick,
}: {
  href?: string
  label: string
  external?: boolean
  onClick?: () => void
}) {
  if (onClick) {
    return (
      <li className='w-full'>
        <button type='button' onClick={onClick} className={`${textLinkClass} cursor-pointer border-none bg-transparent text-left`}>
          {label}
        </button>
      </li>
    )
  }

  return (
    <li className='w-full'>
      <a
        href={href ?? '#'}
        className={textLinkClass}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : undefined)}
      >
        {label}
      </a>
    </li>
  )
}

function DarkModeSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label='Toggle dark mode'
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={(event) => {
        event.stopPropagation()
        onCheckedChange(!checked)
      }}
      className={cn(
        'relative h-5 min-w-[35px] w-[35px] shrink-0 cursor-pointer rounded-full shadow-sm outline-none focus:shadow-md',
        checked ? 'bg-[#2563eb]' : 'bg-white/10'
      )}
    >
      <span
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn(
          'block size-4 translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-black/10 will-change-transform',
          checked && 'translate-x-[17px]'
        )}
      />
    </button>
  )
}

export function PolymarketUserMenu({
  className,
  showChevron = true,
}: PolymarketUserMenuProps) {
  const address = getWalletAddress()
  const { data: summary } = usePortfolioSummary()
  const { data: profile } = usePublicProfile()
  const { resolvedTheme, setTheme } = useTheme()

  const username = summary?.username ?? 'User'
  const profileSlug = buildProfileSlug({ username, address })
  const isDark = resolvedTheme === 'dark'
  const { copyAddress, dialog } = useCopyDeveloperAddress(address)

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <>
      {dialog}
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label='Open user menu'
          className={cn('pm-header-user-btn group', className)}
        >
          <UserAvatar
            className='size-8 shrink-0'
            imageUrl={profile?.profileImage}
          />
          {showChevron ? (
            <ChevronDownIcon className='ml-1.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180' />
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='w-[280px] overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-lg'
      >
        <ul className='relative flex w-full list-none flex-col'>
          <li>
            <div className='relative w-full overflow-hidden px-4 py-3.5 transition-colors duration-200 pm-user-menu-hover has-[[data-user-menu-settings]:hover]:bg-transparent!'>
              <div className='flex w-full items-center justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='w-full'>
                    <Link
                      to='/$slug'
                      params={{ slug: profileSlug }}
                      className='!static cursor-pointer outline-none after:absolute after:inset-0 after:z-20 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring'
                    >
                      <span className='sr-only'>{username}</span>
                    </Link>
                    <div className='pointer-events-none relative z-30 flex w-full cursor-auto flex-row items-center gap-3 transition-all duration-200 ease-in-out hover:bg-transparent [&_a]:pointer-events-auto'>
                      <Link
                        to='/$slug'
                        params={{ slug: profileSlug }}
                        className='shrink-0 cursor-pointer'
                      >
                        <UserAvatar
                          className='size-8 min-w-8 shrink-0'
                          imageUrl={profile?.profileImage}
                        />
                      </Link>
                      <div className='flex min-w-0 flex-col gap-[2px] overflow-hidden'>
                        <Link
                          to='/$slug'
                          params={{ slug: profileSlug }}
                          className='block min-w-0'
                        >
                          <div className='truncate text-[15px] font-semibold text-foreground'>
                            <span className='block truncate'>{username}</span>
                          </div>
                        </Link>
                        <div className='pointer-events-auto'>
                          <button
                            type='button'
                            onClick={copyAddress}
                            className='flex w-fit cursor-pointer items-center gap-2 text-muted-foreground'
                          >
                            <span className='text-xs'>{formatShortAddress(address)}</span>
                            <MenuAddressCopyIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to='/$slug'
                  params={{ slug: profileSlug }}
                  data-user-menu-settings='true'
                  aria-label='Settings'
                  className='relative z-30 shrink-0'
                >
                  <span className='inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-transparent text-foreground transition duration-150 hover:bg-white/[0.06] active:scale-[0.97]'>
                    <MenuSettingsIcon />
                  </span>
                </Link>
              </div>
            </div>
            <hr className='h-px w-full bg-border' />
          </li>

          <div className='flex w-full flex-col p-1.5'>
            <MenuNavLink
              href='https://polymarket.com/leaderboard'
              icon={<MenuLeaderboardIcon />}
              label='Leaderboard'
            />
            <MenuNavLink
              href='https://polymarket.com/rewards'
              icon={<MenuRewardsIcon />}
              label='Rewards'
            />
            <MenuNavLink
              href='https://docs.polymarket.com/api-reference'
              icon={<MenuApisIcon />}
              label='APIs'
              external
            />
            <MenuNavLink
              href='https://polymarket.com/referral'
              icon={<MenuReferIcon />}
              label='Refer & Earn'
            />
            <MenuNavLink
              href='https://docs.polymarket.com'
              icon={<MenuBuildersIcon />}
              label='Builders'
            />
            <li className='inline-flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 text-sm font-normal pm-user-menu-hover'>
              <div className='text-sm font-medium'>
                <div className='flex items-center gap-2 whitespace-nowrap font-medium'>
                  <MenuDarkModeIcon />
                  <span>Dark mode</span>
                </div>
              </div>
              <DarkModeSwitch checked={isDark} onCheckedChange={toggleDarkMode} />
            </li>
          </div>

          <hr className='h-px w-full bg-border' />

          <div className='flex w-full flex-col p-1.5'>
            <MenuTextLink label='Accuracy' href='https://polymarket.com/accuracy' external />
            <MenuTextLink
              label='Support'
              onClick={() => toast.message('Support is not configured in this fork')}
            />
            <MenuTextLink label='Status' href='https://status.polymarket.com' external />
            <MenuTextLink label='Documentation' href='https://docs.polymarket.com' external />
            <MenuTextLink label='Help Center' href='https://help.polymarket.com' external />
            <MenuTextLink label='Terms of Use' href='https://polymarket.com/tos' external />

            <li className='w-full'>
              <button
                type='button'
                className='flex h-10 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-muted-foreground outline-none pm-user-menu-hover'
              >
                <img
                  src='https://polymarket-upload.s3.us-east-2.amazonaws.com/country-flags/usa.png'
                  alt='English'
                  className='size-4 rounded-sm object-cover'
                />
                <span className='font-medium'>Language</span>
                <MenuChevronIcon className='ms-auto size-3.5 text-muted-foreground' />
              </button>
            </li>

            <li className='w-full'>
              <button
                type='button'
                onClick={() => toast.message('Wallet is configured via environment variable')}
                className='flex h-10 w-full cursor-pointer items-center rounded-md px-3 text-sm font-medium text-foreground no-underline outline-none hover:bg-red-500/8'
              >
                <span className='font-medium text-[#e5484d]'>Logout</span>
              </button>
            </li>
          </div>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}
