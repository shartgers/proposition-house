import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { fetchDashboardData } from '@/lib/dashboard-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('fetchDashboardData', () => {
  it('returns 5 propositions ordered 01 to 05', async () => {
    const propositions = await fetchDashboardData(supabase)
    expect(propositions).toHaveLength(5)
    expect(propositions.map((p) => p.number)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('each proposition has at least one offering', async () => {
    const propositions = await fetchDashboardData(supabase)
    for (const p of propositions) {
      expect(p.offerings.length).toBeGreaterThan(0)
    }
  })

  it('each offering has id, name, practice, practiceOwner, and a numeric caseCount', async () => {
    const propositions = await fetchDashboardData(supabase)
    for (const p of propositions) {
      for (const o of p.offerings) {
        expect(typeof o.id).toBe('string')
        expect(typeof o.name).toBe('string')
        expect(typeof o.practice).toBe('string')
        expect(typeof o.practiceOwner).toBe('string')
        expect(typeof o.caseCount).toBe('number')
        expect(o.caseCount).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
