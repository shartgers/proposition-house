import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createOffering, updateOffering, deleteOffering, moveOffering } from '@/lib/offering-mutations'

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fixed IDs for test setup — proposition 01, first practice
const PROP_ID = 'aa1e9cf8-4835-4e84-8689-6664bbe4e49a'

const createdIds: string[] = []

afterEach(async () => {
  if (createdIds.length) {
    await supabase.from('offerings').delete().in('id', createdIds)
    createdIds.length = 0
  }
})

describe('createOffering', () => {
  it('inserts a row and returns an id matching the input name', async () => {
    const result = await createOffering(supabase, {
      name: 'Test offering',
      propositionId: PROP_ID,
    })
    createdIds.push(result.id)

    expect(typeof result.id).toBe('string')

    const { data } = await supabase.from('offerings').select('name').eq('id', result.id).single()
    expect(data?.name).toBe('Test offering')
  })
})

describe('updateOffering', () => {
  it('changes the name in the database', async () => {
    const { id } = await createOffering(supabase, { name: 'Before', propositionId: PROP_ID })
    createdIds.push(id)

    await updateOffering(supabase, id, { name: 'After' })

    const { data } = await supabase.from('offerings').select('name').eq('id', id).single()
    expect(data?.name).toBe('After')
  })
})

describe('moveOffering', () => {
  it('swaps sort_order with the next sibling when moving down', async () => {
    const a = await createOffering(supabase, { name: 'Move-A', propositionId: PROP_ID })
    const b = await createOffering(supabase, { name: 'Move-B', propositionId: PROP_ID })
    createdIds.push(a.id, b.id)

    const { data: before } = await supabase
      .from('offerings')
      .select('id, sort_order')
      .in('id', [a.id, b.id])
      .order('sort_order')

    const orderA = before!.find((r) => r.id === a.id)!.sort_order
    const orderB = before!.find((r) => r.id === b.id)!.sort_order
    expect(orderA).toBeLessThan(orderB)

    await moveOffering(supabase, a.id, 'down')

    const { data: after } = await supabase
      .from('offerings')
      .select('id, sort_order')
      .in('id', [a.id, b.id])
      .order('sort_order')

    expect(after!.find((r) => r.id === a.id)!.sort_order).toBe(orderB)
    expect(after!.find((r) => r.id === b.id)!.sort_order).toBe(orderA)
  })
})

describe('deleteOffering', () => {
  it('removes the row from the database', async () => {
    const { id } = await createOffering(supabase, { name: 'To delete', propositionId: PROP_ID })

    await deleteOffering(supabase, id)

    const { data } = await supabase.from('offerings').select('id').eq('id', id).single()
    expect(data).toBeNull()
  })

  it('sets offering_id to null on linked cases', async () => {
    const { id } = await createOffering(supabase, { name: 'With cases', propositionId: PROP_ID })

    // Link an existing case to this offering
    const { data: caseRow } = await supabase
      .from('cases')
      .select('id')
      .eq('proposition_id', PROP_ID)
      .limit(1)
      .single()

    if (caseRow) {
      await supabase.from('cases').update({ offering_id: id }).eq('id', caseRow.id)

      await deleteOffering(supabase, id)

      const { data: updated } = await supabase
        .from('cases')
        .select('offering_id')
        .eq('id', caseRow.id)
        .single()
      expect(updated?.offering_id).toBeNull()

      // Restore case to unlinked state
      await supabase.from('cases').update({ offering_id: null }).eq('id', caseRow.id)
    }
  })
})
