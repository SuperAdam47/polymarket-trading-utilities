import { useState, type ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

function SelectCheckIcon() {
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
        d='M14.528 5.074a.875.875 0 0 1 1.36 1.102l-7.083 8.75a.876.876 0 0 1-1.363-.004l-3.334-4.167a.875.875 0 0 1 1.367-1.093l2.653 3.317z'
      />
    </svg>
  )
}

function ChevronDownIcon() {
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
        d='M13.548 7.714a.876.876 0 0 1 1.237 1.238l-4.167 4.166a.875.875 0 0 1-1.237 0L5.214 8.952a.877.877 0 0 1 1.238-1.238l3.547 3.548z'
      />
    </svg>
  )
}

function MobileSortIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      className='size-5 rotate-90'
    >
      <path
        fill='currentColor'
        d='M9.256 5.13a.877.877 0 0 1 1.238 0l4.25 4.25a.876.876 0 0 1 0 1.239l-4.25 4.25a.876.876 0 0 1-1.238-1.239l2.756-2.756H5.625a.875.875 0 1 1 0-1.75h6.387L9.256 6.37a.876.876 0 0 1 0-1.239'
      />
    </svg>
  )
}

type PortfolioSelectMenuItemProps = {
  label: string
  selected: boolean
  onSelect: () => void
}

function PortfolioSelectMenuItem({
  label,
  selected,
  onSelect,
}: PortfolioSelectMenuItemProps) {
  return (
    <button
      type='button'
      role='menuitemradio'
      aria-checked={selected}
      data-checked={selected ? '' : undefined}
      data-unchecked={selected ? undefined : ''}
      data-slot='select-menu-item'
      onClick={onSelect}
      className={cn(
        'pm-select-menu-item cursor-default focus:text-[#dee3e7]',
        selected && 'pm-select-menu-item-selected'
      )}
    >
      <div className='flex min-w-0 flex-1 items-center gap-1.5'>
        <span className='min-w-0 flex-1 truncate text-sm font-semibold whitespace-nowrap'>
          {label}
        </span>
      </div>
      <div className='flex shrink-0 items-center gap-1.5'>
        <span
          className={cn(
            'flex shrink-0 items-center text-[#dee3e7] [&_svg]:size-5',
            !selected && 'invisible'
          )}
        >
          <SelectCheckIcon />
        </span>
      </div>
    </button>
  )
}

export type PortfolioSelectProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: Record<T, string>
  icon?: ReactNode
  ariaLabel?: string
  disabled?: boolean
  compactMobile?: boolean
  triggerVariant?: 'default' | 'outline'
  triggerClassName?: string
  wrapperClassName?: string
  menuClassName?: string
}

export function PortfolioSelect<T extends string>({
  value,
  onChange,
  options,
  icon,
  ariaLabel,
  disabled = false,
  compactMobile = false,
  triggerVariant = 'default',
  triggerClassName,
  wrapperClassName,
  menuClassName,
}: PortfolioSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const label = options[value]
  const optionEntries = Object.entries(options) as [T, string][]

  return (
    <div className={cn('shrink-0', wrapperClassName)}>
      <PopoverPrimitive.Root modal={false} open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild disabled={disabled}>
          <button
            type='button'
            aria-label={ariaLabel ?? label}
            aria-haspopup='listbox'
            aria-expanded={open}
            className={cn(
              triggerVariant === 'outline'
                ? 'pm-select-trigger-outline'
                : 'pm-sort-trigger',
              compactMobile &&
                'max-lg:pm-select-trigger-compact max-lg:size-10 max-lg:justify-center max-lg:px-0',
              disabled && 'pm-sort-trigger-disabled',
              triggerClassName
            )}
          >
            {compactMobile ? (
              <span className='hidden lg:contents'>
                {icon ? (
                  <span className='flex shrink-0 items-center [&_svg]:size-5 [&_svg]:text-foreground'>
                    {icon}
                  </span>
                ) : null}
                <span className='pm-select-label shrink-0 px-1 whitespace-nowrap'>
                  {label}
                </span>
                <span className='pm-select-chevron flex shrink-0 items-center [&_svg]:size-5 [&_svg]:text-muted-foreground'>
                  <ChevronDownIcon />
                </span>
              </span>
            ) : (
              <>
                {icon ? (
                  <span className='flex shrink-0 items-center [&_svg]:size-5 [&_svg]:text-foreground'>
                    {icon}
                  </span>
                ) : null}
                <span className='pm-select-label shrink-0 px-1 whitespace-nowrap'>
                  {label}
                </span>
                <span className='pm-select-chevron flex shrink-0 items-center [&_svg]:size-5 [&_svg]:text-muted-foreground'>
                  <ChevronDownIcon />
                </span>
              </>
            )}
            {compactMobile ? (
              <span className='contents lg:hidden'>
                <MobileSortIcon />
              </span>
            ) : null}
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot='popover-content'
            align='end'
            side='bottom'
            sideOffset={6}
            avoidCollisions={false}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onWheel={(event) => event.stopPropagation()}
            style={{
              minWidth: 'var(--radix-popover-trigger-width)',
            }}
            className={cn(
              'pm-select-menu w-max overscroll-contain outline-none',
              menuClassName
            )}
          >
            <div role='group' className='flex w-full min-w-max flex-col'>
              {optionEntries.map(([key, optionLabel]) => (
                <PortfolioSelectMenuItem
                  key={key}
                  label={optionLabel}
                  selected={value === key}
                  onSelect={() => {
                    onChange(key)
                    setOpen(false)
                  }}
                />
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
