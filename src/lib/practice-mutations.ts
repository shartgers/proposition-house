import { SupabaseClient } from '@supabase/supabase-js'
import type { PracticeUnit } from '@/lib/db/types'

export type { PracticeUnit }

export type PracticeInput = {
  name: string
  practiceOwner: string
  unit?: PracticeUnit | null
}

export type Practice = {
  id: string
  name: string
  practiceOwner: string
  unit: PracticeUnit | null
}

export async function getPractices(supabase: SupabaseClient): Promise<Practice[]> {
  const { data, error } = await supabase
    .from('practices')
    .select('id, name, practice_owner, unit')
    .order('name')
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    practiceOwner: p.practice_owner,
    unit: (p.unit as PracticeUnit | null) ?? null,
  }))
}

export async function createPractice(
  supabase: SupabaseClient,
  input: PracticeInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('practices')
    .insert({
      name: input.name,
      practice_owner: input.practiceOwner,
      unit: input.unit ?? null,
    })
    .select('id')
    .single()
  if (error) throw error
  return { id: data.id }
}

export async function updatePractice(
  supabase: SupabaseClient,
  id: string,
  input: Partial<PracticeInput>
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.practiceOwner !== undefined) patch.practice_owner = input.practiceOwner
  if (input.unit !== undefined) patch.unit = input.unit

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
