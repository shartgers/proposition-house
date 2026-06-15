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
        practices ( name, practice_owner, sort_order ),
        cases ( count )
      )
    `)
    .order('number')

  if (error) throw error

  return (data ?? []).map((row) => {
    const offerings = (row.offerings ?? [])
      .map((o: any) => ({
        id: o.id,
        name: o.name,
        practiceId: o.practice_id ?? null,
        practice: o.practices?.name ?? '',
        practiceSortOrder: o.practices?.sort_order ?? 9999,
        practiceOwner: o.practices?.practice_owner ?? '',
        description: o.description ?? null,
        keyOutcomes: o.key_outcomes ?? null,
        caseCount: (o.cases as { count: number }[])?.[0]?.count ?? 0,
        _sortOrder: o.sort_order as number,
      }))
      .sort((a: any, b: any) => {
        if (a.practiceSortOrder !== b.practiceSortOrder) return a.practiceSortOrder - b.practiceSortOrder
        return a._sortOrder - b._sortOrder
      })
      .map(({ _sortOrder: _, ...rest }: any) => rest)

    return { id: row.id, number: row.number, name: row.name, offerings }
  })
}
