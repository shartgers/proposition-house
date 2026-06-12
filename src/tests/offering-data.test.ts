import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import {
  fetchOfferingDetail,
  fetchAllUnallocatedCases,
  sortCasesByProofLevel,
  type CaseDetail,
} from '@/lib/offering-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let firstOfferingId: string

beforeAll(async () => {
  const { data } = await supabase.from('offerings').select('id').limit(1).single()
  firstOfferingId = data!.id
})

describe('fetchOfferingDetail', () => {
  it('returns offering with correct id and all fields for a valid id', async () => {
    const offering = await fetchOfferingDetail(supabase, firstOfferingId)
    expect(offering).not.toBeNull()
    expect(offering!.id).toBe(firstOfferingId)
    expect(typeof offering!.name).toBe('string')
    expect('description' in offering!).toBe(true)
    expect('keyOutcomes' in offering!).toBe(true)
    expect(typeof offering!.practice).toBe('string')
    expect(typeof offering!.practiceOwner).toBe('string')
    expect(typeof offering!.caseCount).toBe('number')
    expect(Array.isArray(offering!.cases)).toBe(true)
  })

  it('returns null for an unknown id', async () => {
    const offering = await fetchOfferingDetail(supabase, '00000000-0000-0000-0000-000000000000')
    expect(offering).toBeNull()
  })
})

describe('fetchAllUnallocatedCases', () => {
  let tempOfferingId: string
  let allocatedCaseId: string
  let originalPropositionId: string

  beforeAll(async () => {
    // Allocate one case to the first offering so it is no longer unallocated.
    const { data: c } = await supabase
      .from('cases')
      .select('id, proposition_id')
      .is('offering_id', null)
      .limit(1)
      .single()
    allocatedCaseId = c!.id
    originalPropositionId = c!.proposition_id
    tempOfferingId = firstOfferingId
    await supabase.from('cases').update({ offering_id: tempOfferingId }).eq('id', allocatedCaseId)
  })

  afterAll(async () => {
    // Restore the borrowed case to the unallocated pool.
    await supabase
      .from('cases')
      .update({ offering_id: null, proposition_id: originalPropositionId })
      .eq('id', allocatedCaseId)
  })

  it('returns only cases with offering_id = null', async () => {
    const cases = await fetchAllUnallocatedCases(supabase)
    expect(cases.some((c) => c.id === allocatedCaseId)).toBe(false)
    expect(cases.length).toBeGreaterThan(0)
  })

  it('returns cases sorted by Proof level (High → Ongoing)', async () => {
    const cases = await fetchAllUnallocatedCases(supabase)
    const expected = sortCasesByProofLevel(cases)
    expect(cases.map((c) => c.id)).toEqual(expected.map((c) => c.id))
  })

  it('returns fully-shaped CaseDetail objects', async () => {
    const cases = await fetchAllUnallocatedCases(supabase)
    const sample = cases[0]
    expect(typeof sample.id).toBe('string')
    expect(typeof sample.clientName).toBe('string')
    expect(typeof sample.proofLevel).toBe('string')
  })
})

describe('sortCasesByProofLevel', () => {
  it('orders High → Medium-High → Medium → Low-Medium → Ongoing', () => {
    const unsorted: CaseDetail[] = [
      { id: '5', clientName: '', sector: '', dateRange: '', proofLevel: 'Ongoing', description: '', result: '' },
      { id: '3', clientName: '', sector: '', dateRange: '', proofLevel: 'Medium', description: '', result: '' },
      { id: '1', clientName: '', sector: '', dateRange: '', proofLevel: 'High', description: '', result: '' },
      { id: '4', clientName: '', sector: '', dateRange: '', proofLevel: 'Low-Medium', description: '', result: '' },
      { id: '2', clientName: '', sector: '', dateRange: '', proofLevel: 'Medium-High', description: '', result: '' },
    ]
    const sorted = sortCasesByProofLevel(unsorted)
    expect(sorted.map((c) => c.proofLevel)).toEqual([
      'High',
      'Medium-High',
      'Medium',
      'Low-Medium',
      'Ongoing',
    ])
  })
})
