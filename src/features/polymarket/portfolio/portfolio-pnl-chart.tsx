import { useEffect, useId, useMemo, useRef, useState } from 'react'
import NumberFlow, { type Format } from '@number-flow/react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PolymarketLogo } from '@/features/polymarket/components/polymarket-logo'
import { periodLabel } from '@/lib/polymarket/pnl'
import { usePnlChart } from '@/features/polymarket/hooks/use-polymarket-data'
import type { PnlChartPeriod, PnlChartPoint } from '@/lib/polymarket/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PERIODS: PnlChartPeriod[] = ['1D', '1W', '1M', '1Y', 'YTD', 'ALL']
const CHART_ANIMATION_MS = 350
const PNL_VALUE_FLOW_TIMING = {
  duration: 400,
  easing: 'ease-out',
} as const
const PM_BRAND = '#0093fd'
const PM_PURPLE = '#9B51E0'
const PM_CURSOR_STROKE = '#B3BEC4'
const PNL_VALUE_FORMAT = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} satisfies Format

function formatHoverTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function PnlTrendIcon({ positive }: { positive: boolean }) {
  if (positive) {
    return (
      <div className='text-pm-green'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='12px'
          height='12px'
          viewBox='0 0 12 12'
          aria-hidden='true'
        >
          <path
            d='m7.248,2.52c-.559-.837-1.938-.837-2.496,0L1.653,7.168c-.308.461-.336,1.051-.074,1.54.262.489.769.792,1.322.792h6.197c.554,0,1.061-.303,1.322-.792.262-.488.233-1.079-.074-1.54l-3.099-4.648Z'
            strokeWidth='0'
            fill='currentColor'
          />
        </svg>
      </div>
    )
  }

  return (
    <div className='text-pm-red'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='12px'
        height='12px'
        viewBox='0 0 12 12'
        aria-hidden='true'
      >
        <path
          d='m9.099,2.5H2.901c-.554,0-1.061.303-1.322.792-.262.488-.233,1.079.074,1.54l3.099,4.648c.279.418.745.668,1.248.668s.969-.25,1.248-.668l3.099-4.648c.308-.461.336-1.051.074-1.54-.262-.489-.769-.792-1.322-.792Z'
          strokeWidth='0'
          fill='currentColor'
        />
      </svg>
    </div>
  )
}

function PnlShareIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 18 18'
      aria-hidden='true'
    >
      <path
        d='M15.25,11.75v1.5c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2v-1.5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <polyline
        points='12.5 6.25 9 2.75 5.5 6.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='9'
        y1='2.75'
        x2='9'
        y2='10.25'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: PnlChartPeriod
  onChange: (period: PnlChartPeriod) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Partial<Record<PnlChartPeriod, HTMLButtonElement>>>(
    {}
  )
  const [indicator, setIndicator] = useState({ left: 0, width: 30 })

  useEffect(() => {
    const updateIndicator = () => {
      const button = buttonRefs.current[period]
      const container = containerRef.current
      if (!button || !container) return

      const containerRect = container.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [period])

  return (
    <div ref={containerRef} className='relative flex shrink-0'>
      <div className='flex gap-0.5'>
        {PERIODS.map((p) => (
          <button
            key={p}
            ref={(el) => {
              if (el) buttonRefs.current[p] = el
            }}
            type='button'
            onClick={() => onChange(p)}
            className={cn(
              'pm-period-tab',
              period === p ? 'pm-period-tab-active' : 'pm-period-tab-inactive'
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <div
        className='pm-period-indicator'
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  )
}

function PnlValueDisplay({ value }: { value: number }) {
  return (
    <NumberFlow
      value={value}
      locales='en-US'
      format={PNL_VALUE_FORMAT}
      transformTiming={PNL_VALUE_FLOW_TIMING}
      spinTiming={PNL_VALUE_FLOW_TIMING}
      opacityTiming={{ duration: 250, easing: 'ease-out' }}
      willChange
      className='pointer-events-none text-3xl font-semibold tabular-nums text-foreground'
      style={{ lineHeight: 1 }}
    />
  )
}

function ChartHoverTracker({
  active,
  payload,
  onHover,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload: PnlChartPoint }>
  onHover: (point: PnlChartPoint | null) => void
}) {
  useEffect(() => {
    onHover(active && payload?.[0] ? payload[0].payload : null)
  }, [active, payload, onHover])

  return null
}

type PnlChartCursorProps = {
  points?: Array<{ x: number; y: number }>
  top?: number
  height?: number
}

function PnlChartCursor({
  points,
  top = 0,
  height = 0,
}: PnlChartCursorProps) {
  const x = points?.[0]?.x
  if (x == null) return null

  return (
    <line
      x1={x}
      y1={top}
      x2={x}
      y2={top + height}
      stroke={PM_CURSOR_STROKE}
      strokeWidth={1.5}
      pointerEvents='none'
    />
  )
}

function PnlActiveDot({
  cx,
  cy,
  gradientId,
}: {
  cx?: number
  cy?: number
  gradientId: string
}) {
  if (cx == null || cy == null) return null

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={`url(#${gradientId})`}
      fillOpacity={1}
      stroke={`url(#${gradientId})`}
      strokeOpacity={0.1}
      strokeWidth={2}
      pointerEvents='none'
    />
  )
}

function PnlChartContent({
  chartData,
  yDomain,
  period,
  strokeGradientId,
  fillGradientId,
  onHover,
}: {
  chartData: PnlChartPoint[]
  yDomain: [number, number]
  period: PnlChartPeriod
  strokeGradientId: string
  fillGradientId: string
  onHover: (point: PnlChartPoint | null) => void
}) {
  return (
    <div
      key={period}
      className='pm-pnl-chart pm-pnl-chart-reveal relative min-h-[64px] w-full flex-1 outline-none'
      style={{ ['--pm-pnl-draw-ms' as string]: `${CHART_ANIMATION_MS}ms` }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className='absolute inset-0 outline-none [&_*]:outline-none'>
        <ResponsiveContainer width='100%' height='100%' minHeight={64}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            tabIndex={-1}
          >
            <defs>
              <linearGradient id={strokeGradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={PM_BRAND} stopOpacity={1} />
                <stop offset='100%' stopColor={PM_PURPLE} stopOpacity={1} />
              </linearGradient>
              <linearGradient id={fillGradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={PM_BRAND} stopOpacity={0.25} />
                <stop offset='100%' stopColor={PM_PURPLE} stopOpacity={0.005} />
              </linearGradient>
            </defs>
            <XAxis dataKey='timestamp' hide />
            <YAxis hide domain={yDomain} />
            <Area
              type='monotone'
              dataKey='value'
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={2}
              strokeLinecap='round'
              fill={`url(#${fillGradientId})`}
              baseValue={yDomain[0]}
              dot={false}
              isAnimationActive={false}
              activeDot={(props) => (
                <PnlActiveDot {...props} gradientId={strokeGradientId} />
              )}
            />
            <Tooltip
              cursor={<PnlChartCursor />}
              content={(props) => (
                <ChartHoverTracker {...props} onHover={onHover} />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PortfolioPnlChart() {
  const [period, setPeriod] = useState<PnlChartPeriod>('1D')
  const [hoverPoint, setHoverPoint] = useState<PnlChartPoint | null>(null)
  const { chartData, pnl, isLoading } = usePnlChart(period)
  const strokeGradientId = useId()
  const fillGradientId = useId()

  const displayValue = hoverPoint?.value ?? pnl
  const isPositive = displayValue >= 0

  const yDomain = useMemo((): [number, number] => {
    if (!chartData.length) return [-1, 1]
    const values = chartData.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = Math.max(Math.abs(max - min) * 0.08, 1)
    return [min - padding, max + padding]
  }, [chartData])

  const handlePeriodChange = (next: PnlChartPeriod) => {
    setHoverPoint(null)
    setPeriod(next)
  }

  return (
    <div className='flex h-full min-h-[225px] flex-col rounded-xl border border-white/[0.06] bg-card p-4'>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className='flex w-full flex-1 flex-col p-0 pb-2'>
          <div className='mb-0 flex w-full flex-row items-center justify-between gap-2'>
            <div className='flex min-w-0 flex-row items-center gap-x-1.5'>
              <PnlTrendIcon positive={isPositive} />
              <h2 className='text-sm font-medium text-muted-foreground'>
                Profit/Loss
              </h2>
            </div>
            <PeriodSelector period={period} onChange={handlePeriodChange} />
          </div>

          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='mb-1 flex min-w-0 items-center gap-1'>
              {isLoading ? (
                <Skeleton className='h-9 w-28 bg-white/5' />
              ) : (
                <PnlValueDisplay value={displayValue} />
              )}
              <button
                type='button'
                className='pm-icon-ghost-btn text-muted-foreground'
                aria-label='Share profit and loss'
              >
                <PnlShareIcon />
              </button>
            </div>
            <PolymarketLogo className='ml-auto h-7 w-auto min-w-[48px] max-w-[90px] shrink opacity-60 text-muted-foreground max-[400px]:w-auto md:max-w-[100px] lg:max-w-[110px]' />
          </div>

          <div className='flex flex-1 flex-col'>
            <p className='mb-2 min-h-5 text-xs leading-5 font-medium text-muted-foreground'>
              {hoverPoint
                ? formatHoverTimestamp(hoverPoint.timestamp)
                : periodLabel(period)}
            </p>
            {isLoading ? (
              <div className='relative min-h-[64px] w-full flex-1'>
                <Skeleton className='absolute inset-0 bg-white/5' />
              </div>
            ) : chartData.length > 0 ? (
              <PnlChartContent
                chartData={chartData}
                yDomain={yDomain}
                period={period}
                strokeGradientId={strokeGradientId}
                fillGradientId={fillGradientId}
                onHover={setHoverPoint}
              />
            ) : (
              <div className='flex min-h-[64px] flex-1 items-center justify-center text-sm text-muted-foreground'>
                No P&L data for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
