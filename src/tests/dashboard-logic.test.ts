import { describe, it, expect } from 'vitest'
import { applyOptimisticSwap } from '@/lib/dashboard-logic'
import type { OfferingView } from '@/lib/views'

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
