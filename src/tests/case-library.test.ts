import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { fetchCaseLibrary, countUnallocatedCases } from '@/lib/case-library'
import { cleanupTestArtifacts } from './helpers/cleanup'

// Tests run against the real Supabase project (same DB as dev).
// Seed must be applied: all 99 cases unallocated, 5 propositions, 24 offerings.

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let prop01Id: string
let prop01CaseCount: number

beforeAll(async () => {
  await cleanupTestArtifacts(supabase)
})

const createdPracticeIds: string[] = []
const createdOfferingIds: string[] = []

afterEach(async () => {
  // Deleting offerings cascades to case_offerings — no manual junction cleanup needed.
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
    expect(Array.isArray(row.offeringNames)).toBe(true)
    expect(Array.isArray(row.practiceNames)).toBe(true)
  })

  it('all 99 seeded cases are unallocated (offeringNames is empty)', async () => {
    const cases = await fetchCaseLibrary(supabase)
    expect(cases.every((c) => c.offeringNames.length === 0)).toBe(true)
    expect(cases.every((c) => c.practiceNames.length === 0)).toBe(true)
  })
})

// ─── countUnallocatedCases ────────────────────────────────────────────────────

describe('countUnallocatedCases', () => {
  it('returns 99 when all cases are unallocated', async () => {
    const count = await countUnallocatedCases(supabase)
    expect(count).toBe(99)
  })

  it('decreases by 1 when a case is linked to an offering', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '01').single()
    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: '__count-test-offering', sort_order: 9999, proposition_id: prop!.id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    const { data: caseRow } = await supabase.from('cases').select('id').limit(1).single()
    await supabase.from('case_offerings').insert({ case_id: caseRow!.id, offering_id: offering!.id })

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
    await supabase.from('case_offerings').insert({ case_id: caseRow!.id, offering_id: offering!.id })

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

    const { data: casePair } = await supabase.from('cases').select('id').limit(2)
    const [caseA, caseB] = casePair!
    await supabase.from('case_offerings').insert([
      { case_id: caseA.id, offering_id: offering!.id },
      { case_id: caseB.id, offering_id: offering!.id },
    ])

    const filtered = await fetchCaseLibrary(supabase, { offeringId: offering!.id })
    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.id).sort()).toEqual([caseA.id, caseB.id].sort())
    expect(filtered.every((c) => c.offeringNames.includes('__offering-filter-test'))).toBe(true)
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
    const filtered = await fetchCaseLibrary(supabase, { sector: 'Energy / Utilities' })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((c) => c.sector === 'Energy / Utilities')).toBe(true)
  })
})

// ─── filter: practiceId ───────────────────────────────────────────────────────

describe('fetchCaseLibrary — filter by practiceId', () => {
  it('returns only cases linked to offerings owned by that practice', async () => {
    const { data: prop } = await supabase.from('propositions').select('id').eq('number', '03').single()

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

    const { data: casePair } = await supabase.from('cases').select('id').limit(2)
    const [caseA, caseB] = casePair!
    await supabase.from('case_offerings').insert([
      { case_id: caseA.id, offering_id: offering!.id },
      { case_id: caseB.id, offering_id: offering!.id },
    ])

    const filtered = await fetchCaseLibrary(supabase, { practiceId: practice!.id })
    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.id).sort()).toEqual([caseA.id, caseB.id].sort())
    expect(filtered.every((c) => c.practiceNames.includes('__practice-filter-test'))).toBe(true)
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
