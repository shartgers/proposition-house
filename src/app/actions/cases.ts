'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { allocateCase } from '@/lib/case-mutations'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

// Returns the offering's name + practice + proposition so callers can update local state
export async function allocateCaseAction(
  caseId: string,
  offeringId: string
): Promise<{ offeringName: string; practiceName: string | null; propositionName: string }> {
  const supabase = await getSupabase()

  // Fetch offering metadata before mutating (needed for return value)
  const { data: offering } = await supabase
    .from('offerings')
    .select('name, propositions ( name ), practices ( name )')
    .eq('id', offeringId)
    .single()

  await allocateCase(supabase, caseId, offeringId)

  revalidatePath('/cases')
  revalidatePath('/')

  const o = offering as {
    name: string
    propositions: { name: string } | null
    practices: { name: string } | null
  } | null

  return {
    offeringName: o?.name ?? '',
    practiceName: (o?.practices as { name: string } | null)?.name ?? null,
    propositionName: (o?.propositions as { name: string } | null)?.name ?? '',
  }
}
