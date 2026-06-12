import { describe, it, expect } from 'vitest'
import {
  applyOptimisticSwap,
  applyOptimisticCaseCountUpdate,
  removeCaseFromUnallocated,
  addCaseToUnallocated,
} from '@/lib/dashboard-logic'
import type { OfferingView } from '@/lib/views'
import type { CaseDetail, ProofLevel } from '@/lib/offering-data'

function makeOffering(id: string): OfferingView {
  return {
    id,
    name: `Offering ${id}`,
    practiceId: null,
    practice: 'Practice',
    practiceOwner: 'Owner',
    description: null,
    keyOutcomes: null,
    caseCount: 0,
  }
}

const A = makeOffering('a')
const B = makeOffering('b')
const C = makeOffering('c')

describe('applyOptimisticSwap', () => {
  it('moves an offering up by swapping with the previous item', () => {
    const result = applyOptimisticSwap([A, B, C], 'b', 'up')
    expect(result?.map((o) => o.id)).toEqual(['b', 'a', 'c'])
  })

  it('moves an offering down by swapping with the next item', () => {
    const result = applyOptimisticSwap([A, B, C], 'b', 'down')
    expect(result?.map((o) => o.id)).toEqual(['a', 'c', 'b'])
  })

  it('returns null when trying to move the first item up', () => {
    const result = applyOptimisticSwap([A, B, C], 'a', 'up')
    expect(result).toBeNull()
  })

  it('returns null when trying to move the last item down', () => {
    const result = applyOptimisticSwap([A, B, C], 'c', 'down')
    expect(result).toBeNull()
  })

  it('returns null when the offering id is not in the list', () => {
    const result = applyOptimisticSwap([A, B, C], 'z', 'up')
    expect(result).toBeNull()
  })

  it('does not mutate the original array', () => {
    const original = [A, B, C]
    applyOptimisticSwap(original, 'b', 'up')
    expect(original.map((o) => o.id)).toEqual(['a', 'b', 'c'])
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
