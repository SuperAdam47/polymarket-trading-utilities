import type { Activity, ClosedPosition } from '@/lib/polymarket/types'

export function getLossClosedPositions(
  closedPositions: ClosedPosition[],
  activities: Activity[]
): ClosedPosition[] {
  const winningRedeems = new Set(
    activities
      .filter((activity) => activity.type === 'REDEEM' && activity.usdcSize > 0)
      .map((activity) => activity.conditionId)
  )

  return closedPositions.filter(
    (position) =>
      position.totalBought > 0 &&
      (position.realizedPnl < 0 || position.curPrice === 0) &&
      !winningRedeems.has(position.conditionId)
  )
}

export function lossPositionCostBasis(position: ClosedPosition): number {
  return position.totalBought * position.avgPrice
}
