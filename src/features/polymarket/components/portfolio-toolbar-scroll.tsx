import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type WheelEvent,
} from 'react'
import { cn } from '@/lib/utils'

function ScrollLeftIcon() {
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
        d='M12.286 5.214a.877.877 0 0 0-1.238 0L6.882 9.381a.875.875 0 0 0 0 1.237l4.166 4.167a.876.876 0 0 0 1.238-1.237L9.738 10l3.548-3.546a.877.877 0 0 0 0-1.238'
      />
    </svg>
  )
}

function ScrollRightIcon() {
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
        d='M7.714 5.214a.877.877 0 0 1 1.238 0l4.166 4.167a.875.875 0 0 1 0 1.237l-4.166 4.167a.876.876 0 0 1-1.238-1.237l3.548-3.55-3.548-3.546a.877.877 0 0 1 0-1.238'
      />
    </svg>
  )
}

type PortfolioToolbarScrollProps = {
  children: ReactNode
  className?: string
  /** spread: search grows on desktop (positions). scroll: horizontal scroll toolbar (history). */
  layout?: 'spread' | 'scroll'
}

export function PortfolioToolbarScroll({
  children,
  className,
  layout = 'spread',
}: PortfolioToolbarScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollStart(el.scrollLeft > 1)
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
  }, [updateScrollState, children])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof Element) {
      if (
        target.closest('[data-slot="dropdown-menu-content"]') ||
        target.closest('[data-slot="popover-content"]') ||
        target.closest('.pm-select-menu')
      ) {
        return
      }
    }

    const el = scrollRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

    event.preventDefault()
    el.scrollLeft += event.deltaY
  }

  return (
    <div
      data-arrow-visibility='hover'
      className={cn(
        'group/scroll-container pm-scroll-fade-x relative min-w-0 w-full lg:flex-1',
        canScrollStart && 'pm-scroll-fade-start',
        canScrollEnd && 'pm-scroll-fade-end',
        className
      )}
    >
      <div
        ref={scrollRef}
        className={cn(
          'no-scrollbar pm-scroll-track z-[2] flex w-full flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain bg-background py-1 pl-1 [&>*]:shrink-0',
          layout === 'spread' &&
            'lg:min-w-0 lg:flex-1 lg:overflow-visible lg:py-0 lg:pl-0 lg:[&>*:first-child]:min-w-0 lg:[&>*:first-child]:flex-1'
        )}
        onWheel={handleWheel}
      >
        {children}
      </div>
      {canScrollStart ? (
        <button
          type='button'
          aria-label='Scroll left'
          className='pm-scroll-arrow pm-scroll-arrow-left pm-scroll-arrow-visible'
          onClick={() => {
            scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
          }}
        >
          <ScrollLeftIcon />
        </button>
      ) : null}
      {canScrollEnd ? (
        <button
          type='button'
          aria-label='Scroll right'
          className='pm-scroll-arrow pm-scroll-arrow-visible'
          onClick={() => {
            scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
          }}
        >
          <ScrollRightIcon />
        </button>
      ) : null}
    </div>
  )
}
