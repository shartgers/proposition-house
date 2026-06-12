import type { OfferingView } from '@/lib/views'

/**
 * Returns a new array with the offering at `offeringId` swapped with its
 * neighbour in `direction`. Returns null when the move is not valid (boundary
 * or missing id) so callers can skip the state update.
 */
export function applyOptimisticSwap(
  offerings: OfferingView[],
  offeringId: string,
  direction: 'up' | 'down'
): OfferingView[] | null {
  const idx = offerings.findIndex((o) => o.id === offeringId)
  if (idx === -1) return null
  if (direction === 'up' && idx === 0) return null
  if (direction === 'down' && idx === offerings.length - 1) return null

  const next = [...offerings]
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
  return next
}
