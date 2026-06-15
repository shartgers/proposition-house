/**
 * View-layer types — enriched shapes returned by data-fetching functions.
 * These are distinct from the raw DB row types in src/lib/db/types.ts.
 */

export type OfferingView = {
  id: string
  name: string
  practiceId: string | null
  practice: string
  practiceSortOrder: number
  practiceOwner: string
  description: string | null
  keyOutcomes: string | null
  caseCount: number
}

export type PropositionView = {
  id: string
  number: string
  name: string
  offerings: OfferingView[]
}
