import { describe, it, expect } from 'vitest'
import { filterCases } from '@/lib/case-filters'
import type { CaseDisplayFilters } from '@/lib/case-filters'
import type { CaseLibraryRow } from '@/lib/case-library'

function makeCase(overrides: Partial<CaseLibraryRow> = {}): CaseLibraryRow {
  return {
    id: 'case-1',
    clientName: 'Client A',
    sector: 'Energy / Utilities',
    dateRange: '2024',
    proofLevel: 'High',
    description: 'desc',
    result: 'result',
    propositionName: 'Clear direction with AI',
    offeringNames: ['AI Strategy'],
    practiceNames: ['Data & AI'],
    ...overrides,
  }
}

const CASES: CaseLibraryRow[] = [
  makeCase({ id: '1', propositionName: 'Clear direction with AI', offeringNames: ['AI Strategy'], proofLevel: 'High', sector: 'Energy / Utilities', practiceNames: ['Data & AI'] }),
  makeCase({ id: '2', propositionName: 'Clear direction with AI', offeringNames: [], proofLevel: 'Medium', sector: 'Financial Services', practiceNames: [] }),
  makeCase({ id: '3', propositionName: 'AI and Agentic solutions', offeringNames: ['LLM Platform'], proofLevel: 'Medium-High', sector: 'Energy / Utilities', practiceNames: ['Engineering'] }),
  makeCase({ id: '4', propositionName: 'Data Foundation', offeringNames: [], proofLevel: 'Low-Medium', sector: 'Public Sector', practiceNames: [] }),
  makeCase({ id: '5', propositionName: 'Trusted AI', offeringNames: ['AI Governance'], proofLevel: 'High', sector: 'Financial Services', practiceNames: ['Data & AI'] }),
]

// ─── no filters ───────────────────────────────────────────────────────────────

describe('filterCases — no filters', () => {
  it('returns all cases when filters object is empty', () => {
    expect(filterCases(CASES, {})).toHaveLength(5)
  })

  it('returns all cases when all filter values are empty strings', () => {
    const filters: CaseDisplayFilters = { propositionName: '', offeringName: undefined, proofLevel: '', sector: '', practiceName: '' }
    expect(filterCases(CASES, filters)).toHaveLength(5)
  })
})

// ─── proposition filter ───────────────────────────────────────────────────────

describe('filterCases — proposition', () => {
  it('returns only cases matching the propositionName', () => {
    const result = filterCases(CASES, { propositionName: 'Clear direction with AI' })
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.propositionName === 'Clear direction with AI')).toBe(true)
  })

  it('returns empty array when no cases match', () => {
    expect(filterCases(CASES, { propositionName: 'Intelligent Workflows' })).toHaveLength(0)
  })
})

// ─── offering filter ──────────────────────────────────────────────────────────

describe('filterCases — offering name', () => {
  it('returns only cases that include the offeringName', () => {
    const result = filterCases(CASES, { offeringName: 'AI Strategy' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns unallocated cases when offeringName is null', () => {
    const result = filterCases(CASES, { offeringName: null })
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.offeringNames.length === 0)).toBe(true)
  })

  it('returns empty array when no cases match the offering', () => {
    expect(filterCases(CASES, { offeringName: 'Nonexistent Offering' })).toHaveLength(0)
  })
})

// ─── proof level filter ───────────────────────────────────────────────────────

describe('filterCases — proof level', () => {
  it('returns only cases matching the proof level', () => {
    const result = filterCases(CASES, { proofLevel: 'High' })
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.proofLevel === 'High')).toBe(true)
  })

  it('returns empty array when no cases match', () => {
    expect(filterCases(CASES, { proofLevel: 'Ongoing' })).toHaveLength(0)
  })
})

// ─── sector filter ────────────────────────────────────────────────────────────

describe('filterCases — sector', () => {
  it('returns only cases in the specified sector', () => {
    const result = filterCases(CASES, { sector: 'Financial Services' })
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.sector === 'Financial Services')).toBe(true)
  })

  it('returns empty array when no cases match', () => {
    expect(filterCases(CASES, { sector: 'Healthcare' })).toHaveLength(0)
  })
})

// ─── practice filter ──────────────────────────────────────────────────────────

describe('filterCases — practice', () => {
  it('returns only cases that include the practiceName', () => {
    const result = filterCases(CASES, { practiceName: 'Data & AI' })
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.practiceNames.includes('Data & AI'))).toBe(true)
  })

  it('returns empty array when no cases match', () => {
    expect(filterCases(CASES, { practiceName: 'Unknown Practice' })).toHaveLength(0)
  })
})

// ─── combined filters ─────────────────────────────────────────────────────────

describe('filterCases — combined filters', () => {
  it('applies all active filters conjunctively', () => {
    const result = filterCases(CASES, {
      propositionName: 'Clear direction with AI',
      proofLevel: 'High',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('proposition + sector combination', () => {
    const result = filterCases(CASES, {
      propositionName: 'Clear direction with AI',
      sector: 'Financial Services',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty array when combined filters match nothing', () => {
    const result = filterCases(CASES, {
      propositionName: 'Data Foundation',
      proofLevel: 'High',
    })
    expect(result).toHaveLength(0)
  })

  it('unallocated + sector combination', () => {
    const result = filterCases(CASES, {
      offeringName: null,
      sector: 'Public Sector',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })
})

// ─── empty input ──────────────────────────────────────────────────────────────

describe('filterCases — empty input', () => {
  it('returns empty array when cases array is empty', () => {
    expect(filterCases([], { propositionName: 'Clear direction with AI' })).toHaveLength(0)
  })
})
