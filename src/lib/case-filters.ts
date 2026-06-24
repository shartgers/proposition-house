import type { CaseLibraryRow } from '@/lib/case-library'

export type CaseDisplayFilters = {
  propositionName?: string
  offeringName?: string | null  // null = unallocated only; undefined/'' = no filter
  proofLevel?: string
  sector?: string
  practiceName?: string
}

export function filterCases(cases: CaseLibraryRow[], filters: CaseDisplayFilters): CaseLibraryRow[] {
  return cases.filter((c) => {
    if (filters.propositionName && c.propositionName !== filters.propositionName) return false
    if (filters.offeringName === null) {
      if (c.offeringNames.length !== 0) return false
    } else if (filters.offeringName) {
      if (!c.offeringNames.includes(filters.offeringName)) return false
    }
    if (filters.proofLevel && c.proofLevel !== filters.proofLevel) return false
    if (filters.sector && c.sector !== filters.sector) return false
    if (filters.practiceName && !c.practiceNames.includes(filters.practiceName)) return false
    return true
  })
}
