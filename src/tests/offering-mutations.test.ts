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

  it('moves the offering to a different proposition', async () => {
    const { id } = await createOffering(supabase, { name: 'Prop-move test', propositionId: PROP_ID })
    createdIds.push(id)

    // Pick any proposition that isn't PROP_ID
    const { data: propositions } = await supabase
      .from('propositions')
      .select('id')
      .neq('id', PROP_ID)
      .limit(1)
      .single()
    const otherPropId = propositions!.id

    await updateOffering(supabase, id, { propositionId: otherPropId })

    const { data } = await supabase.from('offerings').select('proposition_id').eq('id', id).single()
    expect(data?.proposition_id).toBe(otherPropId)
  })
})

describe('moveOffering', () => {
  it('swaps sort_order with the next sibling when moving down within the same practice', async () => {
    const { data: practice } = await supabase
      .from('practices')
      .select('id')
      .limit(1)
      .single()
    const practiceId = practice?.id ?? null

    const a = await createOffering(supabase, { name: 'Move-A', propositionId: PROP_ID, practiceId })
    const b = await createOffering(supabase, { name: 'Move-B', propositionId: PROP_ID, practiceId })
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

  it('moves an offering into the next practice group when moving down across a practice boundary', async () => {
    const { data: practiceRows } = await supabase
      .from('practices')
      .select('id')
      .order('sort_order')
      .limit(2)
    const [pA, pB] = practiceRows!
    if (!pA || !pB) return // skip if fewer than 2 practices exist

    // Create one offering per practice so a is the last in pA and b is first in pB
    const a = await createOffering(supabase, { name: 'CrossA', propositionId: PROP_ID, practiceId: pA.id })
    const b = await createOffering(supabase, { name: 'CrossB', propositionId: PROP_ID, practiceId: pB.id })
    createdIds.push(a.id, b.id)

    await moveOffering(supabase, a.id, 'down')

    const { data: updated } = await supabase
      .from('offerings')
      .select('practice_id')
      .eq('id', a.id)
      .single()

    expect(updated?.practice_id).toBe(pB.id)
  })

  it('moves an offering into the previous practice group when moving up across a practice boundary', async () => {
    const { data: practiceRows } = await supabase
      .from('practices')
      .select('id')
      .order('sort_order')
      .limit(2)
    const [pA, pB] = practiceRows!
    if (!pA || !pB) return

    // Guarantee pA has an entry before pB in visual order by using low sort_orders.
    // sort_order=-2 puts aData first in pA; sort_order=-1 puts bData first in pB.
    const { data: aData } = await supabase
      .from('offerings')
      .insert({ name: 'CrossUp-A', proposition_id: PROP_ID, practice_id: pA.id, sort_order: -2 })
      .select('id')
      .single()
    const { data: bData } = await supabase
      .from('offerings')
      .insert({ name: 'CrossUp-B', proposition_id: PROP_ID, practice_id: pB.id, sort_order: -1 })
      .select('id')
      .single()
    createdIds.push(aData!.id, bData!.id)

    await moveOffering(supabase, bData!.id, 'up')

    const { data: updated } = await supabase
      .from('offerings')
      .select('practice_id')
      .eq('id', bData!.id)
      .single()

    expect(updated?.practice_id).toBe(pA.id)
  })
})

describe('deleteOffering', () => {
  it('removes the row from the database', async () => {
    const { id } = await createOffering(supabase, { name: 'To delete', propositionId: PROP_ID })

    await deleteOffering(supabase, id)

    const { data } = await supabase.from('offerings').select('id').eq('id', id).single()
    expect(data).toBeNull()
  })

  it('cascades to remove case_offerings rows for linked cases', async () => {
    const { id } = await createOffering(supabase, { name: 'With cases', propositionId: PROP_ID })

    const { data: caseRow } = await supabase
      .from('cases')
      .select('id')
      .eq('proposition_id', PROP_ID)
      .limit(1)
      .single()

    if (caseRow) {
      await supabase.from('case_offerings').insert({ case_id: caseRow.id, offering_id: id })

      await deleteOffering(supabase, id)

      const { data: remaining } = await supabase
        .from('case_offerings')
        .select('offering_id')
        .eq('case_id', caseRow.id)
        .eq('offering_id', id)
      expect(remaining).toHaveLength(0)

      // No cleanup needed — cascade deleted the junction row
    }
  })
})
