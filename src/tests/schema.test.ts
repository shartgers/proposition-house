import { describe, it, expect, beforeAll } from 'vitest'
import { createTestClient } from './helpers/client'
import { cleanupTestArtifacts } from './helpers/cleanup'
import type { CaseRow } from '@/lib/db/types'

// These tests run against a real Supabase test project.
// Set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY in .env.test.local.
// The test DB must have migrations applied (npm run db:push) and the seed
// script run (npm run db:seed) before these tests will pass.

const EXPECTED_PROPOSITIONS = [
  { number: '01', name: 'Clear direction with AI' },
  { number: '02', name: 'AI and Agentic Solutions' },
  { number: '03', name: 'Intelligent Workflows' },
  { number: '04', name: 'Data Foundation' },
  { number: '05', name: 'Trusted AI' },
]

describe('schema + seed', () => {
  const client = createTestClient()

  beforeAll(async () => {
    await cleanupTestArtifacts(client)
  })

  // RED → GREEN #1: seed produces exactly 5 propositions with correct names
  describe('propositions', () => {
    it('returns exactly 5 propositions', async () => {
      const { data, error } = await client.from('propositions').select('id, number, name').order('number')
      if (error) throw error
      expect(data).toHaveLength(5)
    })

    it('has correct numbers and names in order', async () => {
      const { data, error } = await client.from('propositions').select('id, number, name').order('number')
      if (error) throw error
      EXPECTED_PROPOSITIONS.forEach(({ number, name }, i) => {
        expect(data![i].number).toBe(number)
        expect(data![i].name).toBe(name)
      })
    })
  })

  // RED → GREEN #2: seed produces 99 cases, all proposition-linked, all unallocated
  describe('seeded cases', () => {
    it('returns exactly 99 cases', async () => {
      const { data, error } = await client.from('cases').select('*')
      if (error) throw error
      expect(data).toHaveLength(99)
    })

    it('all cases have proposition_id set', async () => {
      const { data, error } = await client.from('cases').select('*')
      if (error) throw error
      ;(data as CaseRow[]).forEach((c) => expect(c.proposition_id).toBeTruthy())
    })

    it('all cases start unallocated (no rows in case_offerings)', async () => {
      const { count, error } = await client
        .from('case_offerings')
        .select('*', { count: 'exact', head: true })
      if (error) throw error
      expect(count).toBe(0)
    })
  })

  // RED → GREEN #3: proof_level enum rejects invalid values
  describe('proof_level constraint', () => {
    it('rejects an invalid proof_level value', async () => {
      const { data: proposition } = await client
        .from('propositions')
        .select('id')
        .limit(1)
        .single()

      const { error } = await client.from('cases').insert({
        client_name: 'Test Client',
        sector: 'Test',
        date_range: '2025',
        proof_level: 'Invalid',
        description: 'test',
        result: 'test',
        proposition_id: proposition!.id,
      })

      expect(error).not.toBeNull()
      expect(error!.message).toMatch(/proof_level|invalid input value for enum/i)
    })
  })

  // RED → GREEN #4: deleting an offering cascades to remove case_offerings rows
  describe('offering delete behaviour', () => {
    it('cascade-deletes case_offerings rows when offering is deleted', async () => {
      const { data: proposition } = await client
        .from('propositions')
        .select('id')
        .limit(1)
        .single()

      const { data: offering, error: offeringError } = await client
        .from('offerings')
        .insert({ name: 'Test Offering', sort_order: 999, proposition_id: proposition!.id })
        .select('id')
        .single()
      expect(offeringError).toBeNull()

      // Insert a test case and link it via the junction table
      const { data: insertedCase, error: caseError } = await client
        .from('cases')
        .insert({
          client_name: 'Cascade Test Client',
          sector: 'Test',
          date_range: '2025',
          proof_level: 'Medium',
          description: 'cascade test',
          result: 'n/a',
          proposition_id: proposition!.id,
        })
        .select('id')
        .single()
      expect(caseError).toBeNull()

      await client.from('case_offerings').insert({ case_id: insertedCase!.id, offering_id: offering!.id })

      // Delete the offering — should cascade-delete the junction row
      const { error: deleteError } = await client
        .from('offerings')
        .delete()
        .eq('id', offering!.id)
      expect(deleteError).toBeNull()

      // case_offerings row must be gone
      const { data: remaining } = await client
        .from('case_offerings')
        .select('offering_id')
        .eq('case_id', insertedCase!.id)
      expect(remaining).toHaveLength(0)

      // Case itself must still exist (was not deleted)
      const { data: caseStillExists } = await client
        .from('cases')
        .select('id')
        .eq('id', insertedCase!.id)
        .single()
      expect(caseStillExists).not.toBeNull()

      await client.from('cases').delete().eq('id', insertedCase!.id)
    })
  })
})
