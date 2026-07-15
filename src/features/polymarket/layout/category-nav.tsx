import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDownIcon,
  NavScrollRightIcon,
} from '@/features/polymarket/components/header-icons'
import { CATEGORY_NAV_ITEMS } from './category-nav-items'

export function CategoryNav() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollState()

    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)

    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.preventDefault()
    el.scrollLeft += event.deltaY
  }

  return (
    <div className='mx-auto flex min-w-0 w-full max-w-[1350px] overflow-x-auto px-4 lg:px-6'>
      <div
        data-arrow-visibility='overlay'
        className={cn(
          'pm-nav-scroll-fade relative w-full',
          canScrollEnd && 'pm-nav-scroll-fade-end'
        )}
      >
        <div
          ref={scrollRef}
          className='no-scrollbar flex h-12 min-w-0 w-full snap-x snap-mandatory scroll-px-3 items-center overflow-x-auto pl-0'
          onWheel={handleWheel}
        >
          {CATEGORY_NAV_ITEMS.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={`sep-${index}`}
                  className='mx-2 hidden h-3.5 w-0.5 shrink-0 rounded-full bg-white/10 lg:block'
                  aria-hidden='true'
                />
              )
            }

            const isWorldCup = item.variant === 'world-cup'

            return (
              <button
                key={item.label}
                type='button'
                className={cn(
                  'pm-nav-category-link inline-flex h-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-150',
                  isWorldCup && 'pm-nav-world-cup'
                )}
              >
                {item.icon}
                <span className={isWorldCup ? 'pm-nav-world-cup-label' : undefined}>
                  {item.label}
                </span>
              </button>
            )
          })}
          <button
            type='button'
            aria-label='Open more navigation links'
            className='pm-nav-category-link my-auto hidden h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium outline-none lg:inline-flex'
          >
            More
            <ChevronDownIcon />
          </button>
        </div>
        {canScrollEnd ? (
          <button
            type='button'
            aria-label='Scroll right'
            className='pm-nav-scroll-arrow'
            onClick={() => {
              scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
            }}
          >
            <NavScrollRightIcon />
          </button>
        ) : null}
      </div>
    </div>
  )
}
