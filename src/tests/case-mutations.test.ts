import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { allocateCase } from '@/lib/case-mutations'

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

  // Create two temporary offerings in different propositions
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

  // Pick any seeded case to use as a test subject
  const { data: c } = await supabase.from('cases').select('id').limit(1).single()
  testCaseId = c!.id
})

afterEach(async () => {
  // Restore test case to unallocated + original proposition after each test
  if (testCaseId) {
    const { data: original } = await supabase
      .from('cases')
      .select('proposition_id')
      .eq('id', testCaseId)
      .single()

    await supabase
      .from('cases')
      .update({ offering_id: null, proposition_id: prop01Id })
      .eq('id', testCaseId)
  }
})

// Clean up test offerings at end (vitest doesn't have afterAll in describe, so use module level)
import { afterAll } from 'vitest'
afterAll(async () => {
  if (createdOfferingIds.length) {
    await supabase.from('offerings').delete().in('id', createdOfferingIds)
  }
})

describe('allocateCase', () => {
  it('sets offering_id on the case', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('cases')
      .select('offering_id')
      .eq('id', testCaseId)
      .single()
    expect(data!.offering_id).toBe(offering01Id)
  })

  it('sets proposition_id to the offering\'s proposition', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('cases')
      .select('proposition_id')
      .eq('id', testCaseId)
      .single()
    expect(data!.proposition_id).toBe(prop01Id)
  })

  it('reassignment to a different offering updates offering_id', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering02Id)

    const { data } = await supabase
      .from('cases')
      .select('offering_id')
      .eq('id', testCaseId)
      .single()
    expect(data!.offering_id).toBe(offering02Id)
  })

  it('reassignment to a different proposition updates proposition_id', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering02Id)

    const { data } = await supabase
      .from('cases')
      .select('proposition_id')
      .eq('id', testCaseId)
      .single()
    expect(data!.proposition_id).toBe(prop02Id)
  })

  it('is idempotent — allocating to the same offering twice leaves the case unchanged', async () => {
    await allocateCase(supabase, testCaseId, offering01Id)
    await allocateCase(supabase, testCaseId, offering01Id)

    const { data } = await supabase
      .from('cases')
      .select('offering_id, proposition_id')
      .eq('id', testCaseId)
      .single()
    expect(data!.offering_id).toBe(offering01Id)
    expect(data!.proposition_id).toBe(prop01Id)
  })

  it('throws for a non-existent offering id', async () => {
    await expect(
      allocateCase(supabase, testCaseId, '00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow()
  })
})
