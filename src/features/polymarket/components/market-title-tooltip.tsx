import type { ComponentPropsWithoutRef, ElementType } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const marketTitleTooltipClassName =
  'max-w-xs border border-white/10 bg-[#1a1d21] px-2.5 py-1.5 text-xs font-normal leading-snug text-white shadow-md'

type MarketTitleTooltipProps = {
  title: string
  as?: ElementType
  className?: string
} & Omit<ComponentPropsWithoutRef<'h2'>, 'children' | 'title'>

export function MarketTitleTooltip({
  title,
  as: Tag = 'h2',
  className,
  ...props
}: MarketTitleTooltipProps) {
  if (!title) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Tag className={className} {...props}>
          {title}
        </Tag>
      </TooltipTrigger>
      <TooltipContent
        side='top'
        sideOffset={6}
        hideArrow
        className={marketTitleTooltipClassName}
      >
        {title}
      </TooltipContent>
    </Tooltip>
  )
}
