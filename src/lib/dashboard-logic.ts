import type { OfferingView } from '@/lib/views'
import type { CaseDetail } from '@/lib/offering-data'
import { sortCasesByProofLevel } from '@/lib/offering-data'

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

/** Returns the unallocated-case list without the case `caseId` (used on allocation). */
export function removeCaseFromUnallocated(
  cases: CaseDetail[],
  caseId: string
): CaseDetail[] {
  return cases.filter((c) => c.id !== caseId)
}

/** Appends a case to the unallocated list and re-sorts by Proof level (used on unallocation). */
export function addCaseToUnallocated(
  cases: CaseDetail[],
  caseDetail: CaseDetail
): CaseDetail[] {
  return sortCasesByProofLevel([...cases, caseDetail])
}

export type CaseCountUpdate = {
  /** Offering gaining (delta > 0) or losing (delta < 0) a case. */
  targetOfferingId: string
  /** Offering the case came from in a cross-offering move; receives the opposite delta. */
  sourceOfferingId?: string | null
  /** +1 on allocation, -1 on unallocation. */
  delta: number
}

type OfferingsMap = Record<string, OfferingView[]>

/**
 * Applies an optimistic caseCount change to `localOfferingsMap`: the target
 * Offering gets `+delta`, and the optional source Offering gets `-delta`.
 * Returns the new map and a `rollback` snapshot (the unmodified input map) so
 * the caller can restore prior state if the server call fails. Pure — does not
 * mutate the input.
 */
export function applyOptimisticCaseCountUpdate(
  map: OfferingsMap,
  { targetOfferingId, sourceOfferingId, delta }: CaseCountUpdate
): { next: OfferingsMap; rollback: OfferingsMap } {
  const adjust = (offering: OfferingView): OfferingView => {
    if (offering.id === targetOfferingId) return { ...offering, caseCount: offering.caseCount + delta }
    if (sourceOfferingId && offering.id === sourceOfferingId) return { ...offering, caseCount: offering.caseCount - delta }
    return offering
  }

  const next: OfferingsMap = {}
  for (const [propositionId, offerings] of Object.entries(map)) {
    next[propositionId] = offerings.map(adjust)
  }

  return { next, rollback: map }
}
