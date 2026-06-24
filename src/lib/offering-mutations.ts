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
  if (input.propositionId !== undefined) patch.proposition_id = input.propositionId

  const { error } = await supabase.from('offerings').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteOffering(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  // case_offerings rows are removed automatically by ON DELETE CASCADE.
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
    .select('proposition_id')
    .eq('id', id)
    .single()
  if (fetchError || !current) throw fetchError ?? new Error('Offering not found')

  // Fetch all siblings with their practice sort_order so we can build the visual order
  const { data: siblingsRaw, error: siblingsError } = await supabase
    .from('offerings')
    .select('id, sort_order, practice_id, practices(sort_order)')
    .eq('proposition_id', current.proposition_id)
  if (siblingsError) throw siblingsError
  if (!siblingsRaw?.length) return

  // Sort by (practice.sort_order, offering.sort_order) — matches the UI grouping
  const sorted = [...siblingsRaw].sort((a, b) => {
    const psA = (a.practices as unknown as { sort_order: number } | null)?.sort_order ?? 9999
    const psB = (b.practices as unknown as { sort_order: number } | null)?.sort_order ?? 9999
    if (psA !== psB) return psA - psB
    return a.sort_order - b.sort_order
  })

  const idx = sorted.findIndex((s) => s.id === id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= sorted.length) return

  const mover = sorted[idx]
  const target = sorted[targetIdx]

  if (mover.practice_id === target.practice_id) {
    // Within same practice — swap sort_orders
    await supabase.from('offerings').update({ sort_order: target.sort_order }).eq('id', id)
    await supabase.from('offerings').update({ sort_order: mover.sort_order }).eq('id', target.id)
  } else {
    // Cross-practice — change practice_id and repack all sort_orders so the
    // practice-grouped visual order is reflected in DB sort_orders
    for (let i = 0; i < sorted.length; i++) {
      const update: Record<string, unknown> = { sort_order: i }
      if (sorted[i].id === id) update.practice_id = target.practice_id
      await supabase.from('offerings').update(update).eq('id', sorted[i].id)
    }
  }
}
