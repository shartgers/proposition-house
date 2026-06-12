import { SupabaseClient } from '@supabase/supabase-js'
import type { OfferingView, PropositionView } from './views'

export type { OfferingView, PropositionView }

export async function fetchDashboardData(supabase: SupabaseClient): Promise<PropositionView[]> {
  const { data, error } = await supabase
    .from('propositions')
    .select(`
      id,
      number,
      name,
      offerings (
        id,
        name,
        sort_order,
        practice_id,
        description,
        key_outcomes,
        practices ( name, practice_owner ),
        cases ( count )
      )
    `)
    .order('number')
    .order('sort_order', { referencedTable: 'offerings' })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    number: row.number,
    name: row.name,
    offerings: (row.offerings ?? []).map((o: any) => ({
      id: o.id,
      name: o.name,
      practiceId: o.practice_id ?? null,
      practice: o.practices?.name ?? '',
      practiceOwner: o.practices?.practice_owner ?? '',
      description: o.description ?? null,
      keyOutcomes: o.key_outcomes ?? null,
      caseCount: (o.cases as { count: number }[])?.[0]?.count ?? 0,
    })),
  }))
}
