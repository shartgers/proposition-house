import { describe, it, expect, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { fetchCaseLibrary, countUnallocatedCases } from '@/lib/case-library'

// Tests run against the real Supabase project (same DB as dev).
// Seed must be applied: all 99 cases unallocated, 5 propositions, 24 offerings.

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Proposition 01 id — looked up once, used across filter tests
let prop01Id: string
let prop01CaseCount: number

// Teardown for any test data created mid-suite
const createdPracticeIds: string[] = []
const createdOfferingIds: string[] = []
const linkedCaseIds: string[] = []

afterEach(async () => {
  // unlink cases before deleting offerings
  if (linkedCaseIds.length) {
    await supabase.from('cases').update({ offering_id: null }).in('id', linkedCaseIds)
    linkedCaseIds.length = 0
  }
  if (createdOfferingIds.length) {
    await supabase.from('offerings').delete().in('id', createdOfferingIds)
    createdOfferingIds.length = 0
  }
  if (createdPracticeIds.length) {
    await supabase.from('practices').delete().in('id', createdPracticeIds)
    createdPracticeIds.length = 0
  }
})

// ─── shape ────────────────────────────────────────────────────────────────────

describe('fetchCaseLibrary — shape', () => {
  it('returns exactly 99 cases when no filters applied', async () => {
    const cases = await fetchCaseLibrary(supabase)
    expect(cases).toHaveLength(99)
  })

  it('each row has the required fields', async () => {
    const cases = await fetchCaseLibrary(supabase)
    const row = cases[0]
    expect(typeof row.id).toBe('string')
    expect(typeof row.clientName).toBe('string')
    expect(typeof row.sector).toBe('string')
    expect(typeof row.dateRange).toBe('string')
    expect(typeof row.proofLevel).toBe('string')
    expect(typeof row.description).toBe('string')
    expect(typeof row.result).toBe('string')
    expect(typeof row.propositionName).toBe('string')
    expect(row.propositionName.length).toBeGreaterThan(0)
    // offeringName and practiceName may be null (unallocated)
    expect('offeringName' in row).toBe(true)
    expect('practiceName' in row).toBe(true)
  })

  it('all 99 seeded cases are unallocated (offeringName is null)', async () => {
    const cases = await fetchCaseLibrary(supabase)
    expect(cases.every((c) => c.offeringName === null)).toBe(true)
    expect(cases.every((c) => c.practiceName === null)).toBe(true)
  })
})

// ─── countUnallocatedCases ────────────────────────────────────────────────────

describe('countUnallocatedCases', () => {
  it('returns 99 when all cases are unallocated', async () => {
    const count = await countUnallocatedCases(supabase)
    expect(count).toBe(99)
  })

  it('decreases by 1 when a case is linked to an offering', async () => {
    // Set up a temporary offering and link one case
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '01').single()
    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: '__count-test-offering', sort_order: 9999, proposition_id: prop!.id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    const { data: caseRow } = await supabase.from('cases').select('id').limit(1).single()
    await supabase.from('cases').update({ offering_id: offering!.id }).eq('id', caseRow!.id)
    linkedCaseIds.push(caseRow!.id)

    const count = await countUnallocatedCases(supabase)
    expect(count).toBe(98)
  })
})

// ─── filter: propositionId ────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by propositionId', () => {
  it('narrows to only cases for that proposition', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '01').single()
    prop01Id = prop!.id

    const all = await fetchCaseLibrary(supabase)
    const filtered = await fetchCaseLibrary(supabase, { propositionId: prop01Id })

    prop01CaseCount = filtered.length
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.length).toBeLessThan(all.length)
    expect(filtered.every((c) => c.propositionName === 'Clear direction with AI')).toBe(true)
  })
})

// ─── filter: unallocated ──────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter unallocated (offeringId: null)', () => {
  it('returns all 99 cases when all are unallocated', async () => {
    const cases = await fetchCaseLibrary(supabase, { offeringId: null })
    expect(cases).toHaveLength(99)
  })

  it('excludes a case once it is linked to an offering', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '01').single()
    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: '__unalloc-test-offering', sort_order: 9999, proposition_id: prop!.id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    const { data: caseRow } = await supabase.from('cases').select('id').limit(1).single()
    await supabase.from('cases').update({ offering_id: offering!.id }).eq('id', caseRow!.id)
    linkedCaseIds.push(caseRow!.id)

    const cases = await fetchCaseLibrary(supabase, { offeringId: null })
    expect(cases).toHaveLength(98)
    expect(cases.every((c) => c.id !== caseRow!.id)).toBe(true)
  })
})

// ─── filter: offeringId ───────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by offeringId', () => {
  it('returns only the cases linked to that offering', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '02').single()
    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: '__offering-filter-test', sort_order: 9999, proposition_id: prop!.id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    const { data: [caseA, caseB] } = await supabase.from('cases').select('id').limit(2)
    await supabase.from('cases').update({ offering_id: offering!.id }).in('id', [caseA.id, caseB.id])
    linkedCaseIds.push(caseA.id, caseB.id)

    const filtered = await fetchCaseLibrary(supabase, { offeringId: offering!.id })
    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.id).sort()).toEqual([caseA.id, caseB.id].sort())
    expect(filtered.every((c) => c.offeringName === '__offering-filter-test')).toBe(true)
  })
})

// ─── filter: proofLevel ───────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by proofLevel', () => {
  it('returns only cases with the specified proof level', async () => {
    const filtered = await fetchCaseLibrary(supabase, { proofLevel: 'High' })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((c) => c.proofLevel === 'High')).toBe(true)
  })

  it('combined with propositionId further narrows the result', async () => {
    if (!prop01Id) {
      const { data: prop } = await supabase.from('propositions').select('id').eq('number', '01').single()
      prop01Id = prop!.id
    }
    const combined = await fetchCaseLibrary(supabase, { propositionId: prop01Id, proofLevel: 'High' })
    const propOnly = await fetchCaseLibrary(supabase, { propositionId: prop01Id })
    expect(combined.length).toBeLessThanOrEqual(propOnly.length)
    expect(combined.every((c) => c.proofLevel === 'High')).toBe(true)
  })
})

// ─── filter: sector ───────────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by sector', () => {
  it('returns only cases for that sector', async () => {
    // Energy / Utilities appears frequently in the seed data
    const filtered = await fetchCaseLibrary(supabase, { sector: 'Energy / Utilities' })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((c) => c.sector === 'Energy / Utilities')).toBe(true)
  })
})

// ─── filter: practiceId ───────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by practiceId', () => {
  it('returns only cases linked to offerings owned by that practice', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '03').single()

    // Create a practice and two offerings under it
    const { data: practice } = await supabase
      .from('practices')
      .insert({ name: '__practice-filter-test', practice_owner: 'Tester' })
      .select('id')
      .single()
    createdPracticeIds.push(practice!.id)

    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: '__prac-offering', sort_order: 9999, proposition_id: prop!.id, practice_id: practice!.id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    const { data: [caseA, caseB] } = await supabase.from('cases').select('id').limit(2)
    await supabase.from('cases').update({ offering_id: offering!.id }).in('id', [caseA.id, caseB.id])
    linkedCaseIds.push(caseA.id, caseB.id)

    const filtered = await fetchCaseLibrary(supabase, { practiceId: practice!.id })
    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.id).sort()).toEqual([caseA.id, caseB.id].sort())
    expect(filtered.every((c) => c.practiceName === '__practice-filter-test')).toBe(true)
  })

  it('returns empty array when the practice has no linked offerings', async () => {
    const { data: practice } = await supabase
      .from('practices')
      .insert({ name: '__empty-practice-filter', practice_owner: 'Nobody' })
      .select('id')
      .single()
    createdPracticeIds.push(practice!.id)

    const filtered = await fetchCaseLibrary(supabase, { practiceId: practice!.id })
    expect(filtered).toHaveLength(0)
  })
})
