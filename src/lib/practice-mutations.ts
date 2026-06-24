import { SupabaseClient } from '@supabase/supabase-js'
import type { PracticeUnit } from '@/lib/db/types'

export type { PracticeUnit }

export type PracticeInput = {
  name: string
  practiceOwner: string
  unit?: PracticeUnit | null
  isSector?: boolean
}

// Patch for updatePractice — the form fields plus the manual ordering position,
// which is set when a practice is dragged into a unit (it goes to the bottom).
export type PracticeUpdate = Partial<PracticeInput> & { sortOrder?: number }

export type Practice = {
  id: string
  name: string
  practiceOwner: string
  unit: PracticeUnit | null
  sortOrder: number
  isSector: boolean
}

export async function getPractices(supabase: SupabaseClient): Promise<Practice[]> {
  const { data, error } = await supabase
    .from('practices')
    .select('id, name, practice_owner, unit, sort_order, is_sector')
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    practiceOwner: p.practice_owner,
    unit: (p.unit as PracticeUnit | null) ?? null,
    sortOrder: p.sort_order ?? 0,
    isSector: p.is_sector ?? false,
  }))
}

export async function createPractice(
  supabase: SupabaseClient,
  input: PracticeInput
): Promise<{ id: string; sortOrder: number }> {
  // New practices go to the bottom of the board: one past the current max.
  const { data: maxRow } = await supabase
    .from('practices')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('practices')
    .insert({
      name: input.name,
      practice_owner: input.practiceOwner,
      unit: input.unit ?? null,
      sort_order: sortOrder,
      is_sector: input.isSector ?? false,
    })
    .select('id, sort_order')
    .single()
  if (error) throw error
  return { id: data.id, sortOrder: data.sort_order }
}

export async function updatePractice(
  supabase: SupabaseClient,
  id: string,
  input: PracticeUpdate
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.practiceOwner !== undefined) patch.practice_owner = input.practiceOwner
  if (input.unit !== undefined) patch.unit = input.unit
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder
  if (input.isSector !== undefined) patch.is_sector = input.isSector

  const { error } = await supabase.from('practices').update(patch).eq('id', id)
  if (error) throw error
}

export async function deletePractice(supabase: SupabaseClient, id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from('offerings')
    .select('id', { count: 'exact', head: true })
    .eq('practice_id', id)
  if (countError) throw countError

  if ((count ?? 0) > 0) {
    throw new Error(
      `Cannot delete: this Practice owns ${count} offering${count === 1 ? '' : 's'}. Reassign or remove them first.`
    )
  }

  const { error } = await supabase.from('practices').delete().eq('id', id)
  if (error) throw error
}
