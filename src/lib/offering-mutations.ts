import { SupabaseClient } from '@supabase/supabase-js'

export type OfferingInput = {
  name: string
  description?: string | null
  keyOutcomes?: string | null
  propositionId: string
  practiceId?: string | null
}

export async function createOffering(
  supabase: SupabaseClient,
  input: OfferingInput
): Promise<{ id: string }> {
  const { data: maxRow } = await supabase
    .from('offerings')
    .select('sort_order')
    .eq('proposition_id', input.propositionId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('offerings')
    .insert({
      name: input.name,
      description: input.description ?? null,
      key_outcomes: input.keyOutcomes ?? null,
      proposition_id: input.propositionId,
      practice_id: input.practiceId ?? null,
      sort_order: nextOrder,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

export async function updateOffering(
  supabase: SupabaseClient,
  id: string,
  input: Partial<OfferingInput>
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.description !== undefined) patch.description = input.description
  if (input.keyOutcomes !== undefined) patch.key_outcomes = input.keyOutcomes
  if (input.practiceId !== undefined) patch.practice_id = input.practiceId

  const { error } = await supabase.from('offerings').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteOffering(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error: caseError } = await supabase
    .from('cases')
    .update({ offering_id: null })
    .eq('offering_id', id)
  if (caseError) throw caseError

  const { error } = await supabase.from('offerings').delete().eq('id', id)
  if (error) throw error
}

export async function moveOffering(
  supabase: SupabaseClient,
  id: string,
  direction: 'up' | 'down'
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('offerings')
    .select('sort_order, proposition_id')
    .eq('id', id)
    .single()
  if (fetchError || !current) throw fetchError ?? new Error('Offering not found')

  const { data: siblings } = await supabase
    .from('offerings')
    .select('id, sort_order')
    .eq('proposition_id', current.proposition_id)
    .order('sort_order', { ascending: true })

  if (!siblings) return

  const idx = siblings.findIndex((s) => s.id === id)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= siblings.length) return

  const sibling = siblings[swapIdx]

  await supabase.from('offerings').update({ sort_order: sibling.sort_order }).eq('id', id)
  await supabase.from('offerings').update({ sort_order: current.sort_order }).eq('id', sibling.id)
}
