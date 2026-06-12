import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestClient } from './helpers/client'
import { cleanupTestArtifacts } from './helpers/cleanup'
import { getPropositions } from '@/lib/db/propositions'
import { getCases } from '@/lib/db/cases'

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
      const propositions = await getPropositions(client)
      expect(propositions).toHaveLength(5)
    })

    it('has correct numbers and names in order', async () => {
      const propositions = await getPropositions(client)
      EXPECTED_PROPOSITIONS.forEach(({ number, name }, i) => {
        expect(propositions[i].number).toBe(number)
        expect(propositions[i].name).toBe(name)
      })
    })
  })

  // RED → GREEN #2: seed produces 99 cases, all proposition-linked, all unallocated
  describe('seeded cases', () => {
    it('returns exactly 99 cases', async () => {
      const cases = await getCases(client)
      expect(cases).toHaveLength(99)
    })

    it('all cases have proposition_id set', async () => {
      const cases = await getCases(client)
      cases.forEach((c) => expect(c.proposition_id).toBeTruthy())
    })

    it('all cases start unallocated (offering_id is null)', async () => {
      const cases = await getCases(client)
      cases.forEach((c) => expect(c.offering_id).toBeNull())
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

  // RED → GREEN #4: deleting an offering orphans its cases (SET NULL, not cascade)
  describe('offering delete behaviour', () => {
    it('sets offering_id to null on cases when their offering is deleted', async () => {
      // Insert a test offering
      const { data: proposition } = await client
        .from('propositions')
        .select('id')
        .limit(1)
        .single()

      const { data: offering, error: offeringError } = await client
        .from('offerings')
        .insert({
          name: 'Test Offering',
          sort_order: 999,
          proposition_id: proposition!.id,
        })
        .select('id')
        .single()
      expect(offeringError).toBeNull()

      // Insert a test case linked to that offering
      const { data: insertedCase, error: caseError } = await client
        .from('cases')
        .insert({
          client_name: 'Orphan Test Client',
          sector: 'Test',
          date_range: '2025',
          proof_level: 'Medium',
          description: 'will be orphaned',
          result: 'n/a',
          proposition_id: proposition!.id,
          offering_id: offering!.id,
        })
        .select('id')
        .single()
      expect(caseError).toBeNull()

      // Delete the offering
      const { error: deleteError } = await client
        .from('offerings')
        .delete()
        .eq('id', offering!.id)
      expect(deleteError).toBeNull()

      // Case should still exist with offering_id = null
      const { data: orphanedCase } = await client
        .from('cases')
        .select('offering_id')
        .eq('id', insertedCase!.id)
        .single()

      expect(orphanedCase!.offering_id).toBeNull()

      // Cleanup
      await client.from('cases').delete().eq('id', insertedCase!.id)
    })
  })
})
