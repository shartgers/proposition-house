import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { fetchOfferingDetail, sortCasesByProofLevel, type CaseDetail } from '@/lib/offering-data'

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
