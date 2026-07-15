import type { ReactNode } from 'react'
import { PortfolioSelect } from '@/features/polymarket/components/portfolio-select'
import { cn } from '@/lib/utils'

function SearchIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M8.75 2.875a5.875 5.875 0 0 1 4.727 9.363l3.392 3.394a.875.875 0 0 1-1.237 1.237l-3.394-3.392A5.875 5.875 0 1 1 8.75 2.875m0 1.75a4.125 4.125 0 1 0 0 8.25 4.125 4.125 0 0 0 0-8.25'
      />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M10 1.875a8.125 8.125 0 1 1 0 16.25 8.125 8.125 0 0 1 0-16.25m0 1.75a6.375 6.375 0 1 0 0 12.75 6.375 6.375 0 0 0 0-12.75m2.13 3.006a.876.876 0 0 1 1.24 1.238L11.237 10l2.131 2.13a.876.876 0 0 1-1.238 1.24L10 11.237 7.87 13.37a.876.876 0 0 1-1.24-1.238L8.763 10 6.63 7.87a.876.876 0 0 1 1.238-1.24L10 8.763z'
      />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M13.75 6.375c.483 0 .875.392.875.875v6.887l1.006-1.006a.876.876 0 0 1 1.238 1.238l-2.5 2.5a.9.9 0 0 1-.257.177l-.027.012a.87.87 0 0 1-.67 0l-.028-.012a.9.9 0 0 1-.256-.177l-2.5-2.5a.876.876 0 0 1 1.238-1.238l1.006 1.006V7.25c0-.483.392-.875.875-.875m-3.5 3.5a.875.875 0 0 1 0 1.75h-6.5a.875.875 0 0 1 0-1.75zm0-3.5a.875.875 0 0 1 0 1.75h-6.5a.875.875 0 1 1 0-1.75zm3.5-3.5a.875.875 0 0 1 0 1.75h-10a.875.875 0 1 1 0-1.75z'
      />
    </svg>
  )
}

function ListFilterIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M11 13.875a.875.875 0 0 1 0 1.75H9a.875.875 0 0 1 0-1.75zm2.75-4.75a.875.875 0 0 1 0 1.75h-7.5a.875.875 0 0 1 0-1.75zm2.5-4.75a.875.875 0 0 1 0 1.75H3.75a.875.875 0 1 1 0-1.75z'
      />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M13.25.875c.483 0 .875.392.875.875v1.125h.625a2.875 2.875 0 0 1 2.875 2.875v8.5a2.875 2.875 0 0 1-2.875 2.875h-9.5a2.875 2.875 0 0 1-2.875-2.875v-8.5A2.875 2.875 0 0 1 5.25 2.875h.625V1.75a.875.875 0 1 1 1.75 0v1.125h4.75V1.75c0-.483.392-.875.875-.875m-9.125 7.25v6.125c0 .621.504 1.125 1.125 1.125h9.5c.621 0 1.125-.504 1.125-1.125V8.125zm1.125-3.5c-.621 0-1.125.504-1.125 1.125v.625h11.75V5.75c0-.621-.504-1.125-1.125-1.125z'
      />
    </svg>
  )
}

export function ExportIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
    >
      <path
        fill='currentColor'
        d='M16.25 15.375a.875.875 0 0 1 0 1.75H3.75a.875.875 0 0 1 0-1.75zM10 2.875c.483 0 .875.392.875.875v7.387l2.506-2.506a.876.876 0 0 1 1.238 1.238l-4 4a.9.9 0 0 1-.257.177l-.027.012a.87.87 0 0 1-.67 0 .9.9 0 0 1-.284-.189l-4-4a.876.876 0 0 1 1.238-1.238l2.506 2.506V3.75c0-.483.392-.875.875-.875'
      />
    </svg>
  )
}

export { ClearIcon }

type PortfolioSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  expandOnDesktop?: boolean
}

export function PortfolioSearchInput({
  value,
  onChange,
  placeholder = 'Search',
  readOnly = false,
  expandOnDesktop = true,
}: PortfolioSearchInputProps) {
  return (
    <div
      className={cn(
        'pm-search-wrap relative min-w-0 w-40 shrink-0 transition-[width] duration-[160ms] ease-out motion-reduce:transition-none focus-within:w-60 max-lg:flex-none',
        expandOnDesktop
          ? 'lg:w-full lg:max-w-none lg:flex-1 lg:shrink lg:focus-within:w-full'
          : 'lg:w-40 lg:focus-within:w-60'
      )}
    >
      <label className='pm-search-input group/search'>
        <span className='shrink-0 text-foreground [&_svg]:size-5'>
          <SearchIcon />
        </span>
        <div className='flex min-w-0 flex-1 items-center gap-0.5 px-1'>
          <input
            className='min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/40 max-lg:text-base!'
            placeholder={placeholder}
            aria-label='Search'
            type='text'
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button
          type='button'
          className={cn(
            'invisible absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center rounded-r-[12px] text-muted-foreground hover:text-foreground [&_svg]:size-5 max-lg:group-focus-within/search:visible',
            value && 'lg:visible'
          )}
          aria-label='Clear search'
          tabIndex={-1}
          onClick={() => onChange('')}
        >
          <ClearIcon />
        </button>
      </label>
    </div>
  )
}

export function PortfolioFilterSelect<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  ariaLabel = 'Filter by',
}: {
  value: T
  onChange: (value: T) => void
  options: Record<T, string>
  disabled?: boolean
  ariaLabel?: string
}) {
  return (
    <PortfolioSelect
      value={value}
      onChange={onChange}
      options={options}
      icon={<ListFilterIcon />}
      ariaLabel={ariaLabel}
      disabled={disabled}
    />
  )
}

export function PortfolioSortSelect<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  mobileLabel,
  compactMobile = true,
}: {
  value: T
  onChange: (value: T) => void
  options: Record<T, string>
  disabled?: boolean
  mobileLabel?: string
  compactMobile?: boolean
}) {
  return (
    <PortfolioSelect
      value={value}
      onChange={onChange}
      options={options}
      icon={<SortIcon />}
      ariaLabel={mobileLabel ?? 'Sort by'}
      disabled={disabled}
      compactMobile={compactMobile}
    />
  )
}

type PortfolioToolbarButtonProps = {
  label: string
  icon?: ReactNode
  ariaLabel?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function PortfolioToolbarButton({
  label,
  icon,
  ariaLabel,
  className,
  disabled = false,
  onClick,
}: PortfolioToolbarButtonProps) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn('pm-toolbar-btn', className)}
      aria-label={ariaLabel ?? label}
    >
      {icon ? (
        <span className='flex shrink-0 items-center [&_svg]:size-[18px] [&_svg]:text-foreground'>
          {icon}
        </span>
      ) : null}
      <span className='inline-flex shrink-0 items-center gap-1 px-1.5'>{label}</span>
    </button>
  )
}
