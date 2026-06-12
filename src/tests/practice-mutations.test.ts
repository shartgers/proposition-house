import { describe, it, expect, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  getPractices,
  createPractice,
  updatePractice,
  deletePractice,
} from '@/lib/practice-mutations'
import type { PracticeUnit } from '@/lib/db/types'

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const createdPracticeIds: string[] = []
const createdOfferingIds: string[] = []

// Fixed proposition id — proposition 01
const PROP_ID = 'aa1e9cf8-4835-4e84-8689-6664bbe4e49a'

afterEach(async () => {
  if (createdOfferingIds.length) {
    await supabase.from('offerings').delete().in('id', createdOfferingIds)
    createdOfferingIds.length = 0
  }
  if (createdPracticeIds.length) {
    await supabase.from('practices').delete().in('id', createdPracticeIds)
    createdPracticeIds.length = 0
  }
})

describe('getPractices', () => {
  it('returns an array of practices each with id, name, and practiceOwner', async () => {
    const practices = await getPractices(supabase)
    expect(Array.isArray(practices)).toBe(true)
    expect(practices.length).toBeGreaterThan(0)
    const first = practices[0]
    expect(typeof first.id).toBe('string')
    expect(typeof first.name).toBe('string')
    expect(typeof first.practiceOwner).toBe('string')
  })

  it('returns practices sorted by name', async () => {
    const practices = await getPractices(supabase)
    const names = practices.map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})

describe('createPractice', () => {
  it('inserts a row and returns an id', async () => {
    const result = await createPractice(supabase, {
      name: 'Test Practice',
      practiceOwner: 'Test Owner',
    })
    createdPracticeIds.push(result.id)

    expect(typeof result.id).toBe('string')
    const { data } = await supabase
      .from('practices')
      .select('name, practice_owner')
      .eq('id', result.id)
      .single()
    expect(data?.name).toBe('Test Practice')
    expect(data?.practice_owner).toBe('Test Owner')
  })

  it('new practice appears in getPractices', async () => {
    const result = await createPractice(supabase, {
      name: 'Visible Practice',
      practiceOwner: 'Visible Owner',
    })
    createdPracticeIds.push(result.id)

    const practices = await getPractices(supabase)
    expect(practices.some((p) => p.id === result.id)).toBe(true)
  })
})

describe('updatePractice', () => {
  it('changes the name in the database', async () => {
    const { id } = await createPractice(supabase, { name: 'Before', practiceOwner: 'Owner' })
    createdPracticeIds.push(id)

    await updatePractice(supabase, id, { name: 'After' })

    const { data } = await supabase.from('practices').select('name').eq('id', id).single()
    expect(data?.name).toBe('After')
  })

  it('changes the practiceOwner in the database', async () => {
    const { id } = await createPractice(supabase, { name: 'Practice', practiceOwner: 'Alice' })
    createdPracticeIds.push(id)

    await updatePractice(supabase, id, { practiceOwner: 'Bob' })

    const { data } = await supabase.from('practices').select('practice_owner').eq('id', id).single()
    expect(data?.practice_owner).toBe('Bob')
  })

  it('can update both name and practiceOwner in one call', async () => {
    const { id } = await createPractice(supabase, { name: 'Old Name', practiceOwner: 'Old Owner' })
    createdPracticeIds.push(id)

    await updatePractice(supabase, id, { name: 'New Name', practiceOwner: 'New Owner' })

    const { data } = await supabase
      .from('practices')
      .select('name, practice_owner')
      .eq('id', id)
      .single()
    expect(data?.name).toBe('New Name')
    expect(data?.practice_owner).toBe('New Owner')
  })
})

// ─── unit field ───────────────────────────────────────────────────────────────

describe('createPractice — unit field', () => {
  it('stores the unit when provided', async () => {
    const { id } = await createPractice(supabase, {
      name: '__Unit Practice',
      practiceOwner: 'Owner',
      unit: 'AI Solutions',
    })
    createdPracticeIds.push(id)

    const { data } = await supabase.from('practices').select('unit').eq('id', id).single()
    expect(data?.unit).toBe('AI Solutions')
  })

  it('defaults unit to null when omitted', async () => {
    const { id } = await createPractice(supabase, {
      name: '__No Unit Practice',
      practiceOwner: 'Owner',
    })
    createdPracticeIds.push(id)

    const { data } = await supabase.from('practices').select('unit').eq('id', id).single()
    expect(data?.unit).toBeNull()
  })
})

describe('updatePractice — unit field', () => {
  it('sets the unit on an existing practice', async () => {
    const { id } = await createPractice(supabase, { name: '__Set Unit', practiceOwner: 'Owner' })
    createdPracticeIds.push(id)

    await updatePractice(supabase, id, { unit: 'Data Platform Engineering' })

    const { data } = await supabase.from('practices').select('unit').eq('id', id).single()
    expect(data?.unit).toBe('Data Platform Engineering')
  })

  it('clears the unit when set to null', async () => {
    const { id } = await createPractice(supabase, {
      name: '__Clear Unit',
      practiceOwner: 'Owner',
      unit: 'AI Solutions',
    })
    createdPracticeIds.push(id)

    await updatePractice(supabase, id, { unit: null })

    const { data } = await supabase.from('practices').select('unit').eq('id', id).single()
    expect(data?.unit).toBeNull()
  })
})

describe('getPractices — unit field', () => {
  it('returns the unit field for each practice', async () => {
    const { id } = await createPractice(supabase, {
      name: '__Unit Visible',
      practiceOwner: 'Owner',
      unit: 'Analytics & Data Engineering',
    })
    createdPracticeIds.push(id)

    const practices = await getPractices(supabase)
    const found = practices.find((p) => p.id === id)
    expect(found).toBeDefined()
    expect(found?.unit).toBe('Analytics & Data Engineering' satisfies PracticeUnit)
  })

  it('returns null unit for practices without one', async () => {
    const { id } = await createPractice(supabase, {
      name: '__Null Unit',
      practiceOwner: 'Owner',
    })
    createdPracticeIds.push(id)

    const practices = await getPractices(supabase)
    const found = practices.find((p) => p.id === id)
    expect(found?.unit).toBeNull()
  })
})

describe('deletePractice', () => {
  it('removes the row when the practice has no offerings', async () => {
    const { id } = await createPractice(supabase, { name: 'Empty Practice', practiceOwner: 'Nobody' })

    await deletePractice(supabase, id)

    const { data } = await supabase.from('practices').select('id').eq('id', id).single()
    expect(data).toBeNull()
  })

  it('removed practice no longer appears in getPractices', async () => {
    const { id } = await createPractice(supabase, { name: 'Gone Practice', practiceOwner: 'Nobody' })

    await deletePractice(supabase, id)

    const practices = await getPractices(supabase)
    expect(practices.some((p) => p.id === id)).toBe(false)
  })

  it('throws when the practice has linked offerings', async () => {
    const { id } = await createPractice(supabase, { name: 'Owned Practice', practiceOwner: 'Owner' })
    createdPracticeIds.push(id)

    // Link an offering to this practice
    const { data: offering } = await supabase
      .from('offerings')
      .insert({ name: 'Linked Offering', sort_order: 999, proposition_id: PROP_ID, practice_id: id })
      .select('id')
      .single()
    createdOfferingIds.push(offering!.id)

    await expect(deletePractice(supabase, id)).rejects.toThrow(/offering/i)

    // Practice must still exist
    const { data } = await supabase.from('practices').select('id').eq('id', id).single()
    expect(data).not.toBeNull()
  })
})
