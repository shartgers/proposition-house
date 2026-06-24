import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { allocateCase, unallocateCase, removeCaseFromOffering } from '@/lib/case-mutations'

// Tests run against the real Supabase project.
// Seed must be applied: all 99 cases unallocated, propositions 01–05 present.

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let prop01Id: string
let prop02Id: string
let offering01Id: string  // an offering in proposition 01
let offering02Id: string  // an offering in proposition 02
let testCaseId: string    // a real seeded case we'll allocate and restore

const createdOfferingIds: string[] = []

beforeAll(async () => {
  const { data: props } = await supabase
    .from('propositions')
    .select('id, number')
    .in('number', ['01', '02'])
  prop01Id = props!.find((p) => p.number === '01')!.id
  prop02Id = props!.find((p) => p.number === '02')!.id

  const { data: o1 } = await supabase
    .from('offerings')
    .insert({ name: '__alloc-test-01', sort_order: 9998, proposition_id: prop01Id })
    .select('id')
    .single()
  offering01Id = o1!.id
  createdOfferingIds.push(offering01Id)

  const { data: o2 } = await supabase
    .from('offerings')
    .insert({ name: '__alloc-test-02', sort_order: 9999, proposition_id: prop02Id })
    .select('id')
    .single()
  offering02Id = o2!.id
  createdOfferingIds.push(offering02Id)

  const { data: c } = await supabase.from('cases').select('id').limit(1).single()
  testCaseId = c!.id
})

afterEach(async () => {
  if (testCaseId) {
    await supabase.from('case_offerings').delete().eq('case_id', testCaseId)
  }
})

afterAll(async () => {
  if (createdOfferingIds.length) {
    await supabase.from('offerings').delete().in('id', createdOfferingIds)
  }
})

describe('allocateCase', () => {
  it('inserts a row into case_offerings', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('case_offerings')
      .select('offering_id')
      .eq('case_id', testCaseId)
    expect(data?.map((r) => r.offering_id)).toContain(offering01Id)
  })

  it('does not modify proposition_id on the case', async () => {
    const { data: before } = await supabase
      .from('cases')
      .select('proposition_id')
      .eq('id', testCaseId)
      .single()

    await allocateCase(supabase, testCaseId, offering02Id)

    const { data: after } = await supabase
      .from('cases')
      .select('proposition_id')
      .eq('id', testCaseId)
      .single()
    expect(after!.proposition_id).toBe(before!.proposition_id)
  })

  it('can allocate to multiple offerings', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering02Id)

    const { data } = await supabase
      .from('case_offerings')
      .select('offering_id')
      .eq('case_id', testCaseId)
    const ids = data?.map((r) => r.offering_id) ?? []
    expect(ids).toContain(offering01Id)
    expect(ids).toContain(offering02Id)
  })

  it('is idempotent — allocating to the same offering twice creates no duplicate', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('case_offerings')
      .select('offering_id')
      .eq('case_id', testCaseId)
      .eq('offering_id', offering01Id)
    expect(data).toHaveLength(1)
  })

  it('throws for a non-existent offering id', async () => {
    await expect(
      allocateCase(supabase, testCaseId, '00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow()
  })
})

describe('removeCaseFromOffering', () => {
  it('removes the specific row from case_offerings', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering02Id)

    await removeCaseFromOffering(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('case_offerings')
      .select('offering_id')
      .eq('case_id', testCaseId)
    const ids = data?.map((r) => r.offering_id) ?? []
    expect(ids).not.toContain(offering01Id)
    expect(ids).toContain(offering02Id)
  })
})

describe('unallocateCase', () => {
  it('removes all case_offerings rows for the case', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering02Id)

    await unallocateCase(supabase, testCaseId)

    const { data } = await supabase
      .from('case_offerings')
      .select('offering_id')
      .eq('case_id', testCaseId)
    expect(data).toHaveLength(0)
  })

  it('is safe on an already unallocated case', async () => {
    await expect(unallocateCase(supabase, testCaseId)).resolves.not.toThrow()
  })
})
