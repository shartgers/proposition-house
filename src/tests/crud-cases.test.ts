import { describe, it, expect, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createCase, updateCase, deleteCase } from '@/lib/case-mutations'

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PROP_ID = 'aa1e9cf8-4835-4e84-8689-6664bbe4e49a' // proposition 01

const createdIds: string[] = []

afterEach(async () => {
  if (createdIds.length) {
    await supabase.from('cases').delete().in('id', createdIds)
    createdIds.length = 0
  }
})

describe('createCase', () => {
  it('inserts a case with all six fields and starts unallocated', async () => {
    const result = await createCase(supabase, {
      clientName: '__Test Client',
      sector: 'Energy',
      dateRange: '2024',
      proofLevel: 'High',
      description: 'Test description',
      result: 'Test result',
      propositionId: PROP_ID,
    })
    createdIds.push(result.id)

    const { data } = await supabase.from('cases').select('*').eq('id', result.id).single()
    expect(data?.client_name).toBe('__Test Client')
    expect(data?.sector).toBe('Energy')
    expect(data?.date_range).toBe('2024')
    expect(data?.proof_level).toBe('High')
    expect(data?.description).toBe('Test description')
    expect(data?.result).toBe('Test result')
    expect(data?.proposition_id).toBe(PROP_ID)
    expect(data?.offering_id).toBeNull()
  })
})

describe('updateCase', () => {
  it('updates all six content fields', async () => {
    const { id } = await createCase(supabase, {
      clientName: '__Before',
      sector: 'Energy',
      dateRange: '2023',
      proofLevel: 'Low-Medium',
      description: 'Old description',
      result: 'Old result',
      propositionId: PROP_ID,
    })
    createdIds.push(id)

    await updateCase(supabase, id, {
      clientName: '__After',
      sector: 'Finance',
      dateRange: '2024',
      proofLevel: 'High',
      description: 'New description',
      result: 'New result',
    })

    const { data } = await supabase.from('cases').select('*').eq('id', id).single()
    expect(data?.client_name).toBe('__After')
    expect(data?.sector).toBe('Finance')
    expect(data?.date_range).toBe('2024')
    expect(data?.proof_level).toBe('High')
    expect(data?.description).toBe('New description')
    expect(data?.result).toBe('New result')
  })

  it('partial update leaves unchanged fields intact', async () => {
    const { id } = await createCase(supabase, {
      clientName: '__Partial',
      sector: 'Energy',
      dateRange: '2024',
      proofLevel: 'High',
      description: 'Stable description',
      result: 'Stable result',
      propositionId: PROP_ID,
    })
    createdIds.push(id)

    await updateCase(supabase, id, { clientName: '__Renamed' })

    const { data } = await supabase.from('cases').select('*').eq('id', id).single()
    expect(data?.client_name).toBe('__Renamed')
    expect(data?.description).toBe('Stable description')
    expect(data?.result).toBe('Stable result')
  })
})

describe('deleteCase', () => {
  it('removes the case from the database', async () => {
    const { id } = await createCase(supabase, {
      clientName: '__Delete Me',
      sector: 'Energy',
      dateRange: '2024',
      proofLevel: 'High',
      description: 'To be deleted',
      result: 'N/A',
      propositionId: PROP_ID,
    })

    await deleteCase(supabase, id)

    const { data } = await supabase.from('cases').select('id').eq('id', id).single()
    expect(data).toBeNull()
  })
})
