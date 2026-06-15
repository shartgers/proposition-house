import { describe, it, expect } from 'vitest'
import {
  applyOptimisticMove,
  applyOptimisticCaseCountUpdate,
  removeCaseFromUnallocated,
  addCaseToUnallocated,
} from '@/lib/dashboard-logic'
import type { OfferingView } from '@/lib/views'
import type { CaseDetail, ProofLevel } from '@/lib/offering-data'

function makeOffering(
  id: string,
  opts: { practiceId?: string | null; practiceName?: string; practiceSortOrder?: number } = {}
): OfferingView {
  return {
    id,
    name: `Offering ${id}`,
    practiceId: opts.practiceId ?? null,
    practice: opts.practiceName ?? '',
    practiceSortOrder: opts.practiceSortOrder ?? 0,
    practiceOwner: '',
    description: null,
    keyOutcomes: null,
    caseCount: 0,
  }
}

// Same-practice offerings (practiceId: null)
const A = makeOffering('a')
const B = makeOffering('b')
const C = makeOffering('c')

// Two-practice setup: Practice A (sortOrder 1) and Practice B (sortOrder 2)
const A1 = makeOffering('a1', { practiceId: 'pA', practiceName: 'Practice A', practiceSortOrder: 1 })
const A2 = makeOffering('a2', { practiceId: 'pA', practiceName: 'Practice A', practiceSortOrder: 1 })
const B1 = makeOffering('b1', { practiceId: 'pB', practiceName: 'Practice B', practiceSortOrder: 2 })
const B2 = makeOffering('b2', { practiceId: 'pB', practiceName: 'Practice B', practiceSortOrder: 2 })

describe('applyOptimisticMove — within practice', () => {
  it('moves an offering up by swapping with the previous item', () => {
    const result = applyOptimisticMove([A, B, C], 'b', 'up')
    expect(result?.map((o) => o.id)).toEqual(['b', 'a', 'c'])
  })

  it('moves an offering down by swapping with the next item', () => {
    const result = applyOptimisticMove([A, B, C], 'b', 'down')
    expect(result?.map((o) => o.id)).toEqual(['a', 'c', 'b'])
  })

  it('returns null when trying to move the first item up', () => {
    const result = applyOptimisticMove([A, B, C], 'a', 'up')
    expect(result).toBeNull()
  })

  it('returns null when trying to move the last item down', () => {
    const result = applyOptimisticMove([A, B, C], 'c', 'down')
    expect(result).toBeNull()
  })

  it('returns null when the offering id is not in the list', () => {
    const result = applyOptimisticMove([A, B, C], 'z', 'up')
    expect(result).toBeNull()
  })

  it('does not mutate the original array', () => {
    const original = [A, B, C]
    applyOptimisticMove(original, 'b', 'up')
    expect(original.map((o) => o.id)).toEqual(['a', 'b', 'c'])
  })

  it('swaps within-practice without changing practiceId', () => {
    const result = applyOptimisticMove([A1, A2, B1, B2], 'a1', 'down')
    expect(result?.map((o) => o.id)).toEqual(['a2', 'a1', 'b1', 'b2'])
    expect(result?.find((o) => o.id === 'a1')?.practiceId).toBe('pA')
  })
})

describe('applyOptimisticMove — cross practice', () => {
  it('moving the last item in a group DOWN changes its practiceId to the next group, keeping position', () => {
    const result = applyOptimisticMove([A1, A2, B1, B2], 'a2', 'down')
    // a2 stays at index 1, gets practice B
    expect(result?.map((o) => o.id)).toEqual(['a1', 'a2', 'b1', 'b2'])
    const moved = result?.find((o) => o.id === 'a2')!
    expect(moved.practiceId).toBe('pB')
    expect(moved.practice).toBe('Practice B')
    expect(moved.practiceSortOrder).toBe(2)
  })

  it('moving the first item in a group UP changes its practiceId to the previous group, keeping position', () => {
    const result = applyOptimisticMove([A1, A2, B1, B2], 'b1', 'up')
    // b1 stays at index 2, gets practice A
    expect(result?.map((o) => o.id)).toEqual(['a1', 'a2', 'b1', 'b2'])
    const moved = result?.find((o) => o.id === 'b1')!
    expect(moved.practiceId).toBe('pA')
    expect(moved.practice).toBe('Practice A')
    expect(moved.practiceSortOrder).toBe(1)
  })

  it('does not change the positions of other offerings on cross-practice move', () => {
    const result = applyOptimisticMove([A1, A2, B1, B2], 'a2', 'down')
    expect(result?.find((o) => o.id === 'b1')?.practiceId).toBe('pB')
    expect(result?.find((o) => o.id === 'a1')?.practiceId).toBe('pA')
  })

  it('does not mutate the original array on cross-practice move', () => {
    const original = [A1, A2, B1, B2]
    applyOptimisticMove(original, 'a2', 'down')
    expect(original.find((o) => o.id === 'a2')?.practiceId).toBe('pA')
  })
})

function makeCase(id: string, proofLevel: ProofLevel = 'Medium'): CaseDetail {
  return {
    id,
    clientName: `Client ${id}`,
    sector: 'Energy',
    dateRange: '2025',
    proofLevel,
    description: 'desc',
    result: 'result',
    propositionId: 'p1',
  }
}

describe('removeCaseFromUnallocated', () => {
  it('returns the list without the given case', () => {
    const list = [makeCase('a'), makeCase('b'), makeCase('c')]
    const result = removeCaseFromUnallocated(list, 'b')
    expect(result.map((c) => c.id)).toEqual(['a', 'c'])
  })

  it('leaves the remaining order intact', () => {
    const list = [makeCase('a', 'High'), makeCase('b'), makeCase('c', 'Ongoing')]
    const result = removeCaseFromUnallocated(list, 'a')
    expect(result.map((c) => c.id)).toEqual(['b', 'c'])
  })

  it('returns an equivalent list when the id is absent', () => {
    const list = [makeCase('a'), makeCase('b')]
    const result = removeCaseFromUnallocated(list, 'z')
    expect(result.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('does not mutate the original array', () => {
    const list = [makeCase('a'), makeCase('b')]
    removeCaseFromUnallocated(list, 'a')
    expect(list.map((c) => c.id)).toEqual(['a', 'b'])
  })
})

describe('addCaseToUnallocated', () => {
  it('appends the case and re-sorts by proof level (High first)', () => {
    const list = [makeCase('a', 'High'), makeCase('b', 'Ongoing')]
    const result = addCaseToUnallocated(list, makeCase('c', 'Medium'))
    expect(result.map((c) => c.id)).toEqual(['a', 'c', 'b'])
  })

  it('places a High case ahead of an existing Medium case', () => {
    const list = [makeCase('a', 'Medium')]
    const result = addCaseToUnallocated(list, makeCase('b', 'High'))
    expect(result.map((c) => c.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the original array', () => {
    const list = [makeCase('a', 'High')]
    addCaseToUnallocated(list, makeCase('b', 'Medium'))
    expect(list.map((c) => c.id)).toEqual(['a'])
  })
})

describe('applyOptimisticCaseCountUpdate', () => {
  const map = (): Record<string, OfferingView[]> => ({
    p1: [{ ...makeOffering('a'), caseCount: 2 }, { ...makeOffering('b'), caseCount: 5 }],
    p2: [{ ...makeOffering('c'), caseCount: 0 }],
  })

  it('increments the target offering count', () => {
    const { next } = applyOptimisticCaseCountUpdate(map(), { targetOfferingId: 'a', delta: 1 })
    expect(next.p1.find((o) => o.id === 'a')!.caseCount).toBe(3)
  })

  it('decrements the target offering count', () => {
    const { next } = applyOptimisticCaseCountUpdate(map(), { targetOfferingId: 'b', delta: -1 })
    expect(next.p1.find((o) => o.id === 'b')!.caseCount).toBe(4)
  })

  it('applies the opposite delta to the source offering (cross-offering move)', () => {
    const { next } = applyOptimisticCaseCountUpdate(map(), {
      targetOfferingId: 'c',
      sourceOfferingId: 'a',
      delta: 1,
    })
    expect(next.p2.find((o) => o.id === 'c')!.caseCount).toBe(1)
    expect(next.p1.find((o) => o.id === 'a')!.caseCount).toBe(1)
  })

  it('returns a rollback snapshot that restores the prior counts', () => {
    const original = map()
    const { rollback } = applyOptimisticCaseCountUpdate(original, { targetOfferingId: 'a', delta: 1 })
    expect(rollback.p1.find((o) => o.id === 'a')!.caseCount).toBe(2)
  })

  it('does not mutate the input map', () => {
    const original = map()
    applyOptimisticCaseCountUpdate(original, { targetOfferingId: 'a', delta: 1 })
    expect(original.p1.find((o) => o.id === 'a')!.caseCount).toBe(2)
  })
})
