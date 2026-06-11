// One-time seed script: parses input/xomnia_use_cases.md and inserts 99 cases
// into the cases table with proposition_id set and offering_id null.
//
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
// (or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for convenience)
//
// Run: npm run db:seed

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local so the script works without a separate env setup step
try {
  readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
      if (m) process.env[m[1]] = m[2].trim()
    })
} catch {}

type ProofLevel = 'High' | 'Medium-High' | 'Medium' | 'Low-Medium' | 'Ongoing'

type ParsedCase = {
  client_name: string
  sector: string
  date_range: string
  proof_level: ProofLevel
  description: string
  result: string
  proposition_number: string
}

const VALID_PROOF_LEVELS = new Set<string>(['High', 'Medium-High', 'Medium', 'Low-Medium', 'Ongoing'])

function normalizeProofLevel(raw: string): ProofLevel {
  const trimmed = raw.trim()
  if (VALID_PROOF_LEVELS.has(trimmed)) return trimmed as ProofLevel
  // Fallback for unexpected variants
  if (trimmed.toLowerCase().includes('ongoing')) return 'Ongoing'
  if (trimmed.toLowerCase().includes('low')) return 'Low-Medium'
  if (trimmed.toLowerCase().includes('high') && trimmed.toLowerCase().includes('medium')) return 'Medium-High'
  if (trimmed.toLowerCase().includes('high')) return 'High'
  return 'Medium'
}

function parseUseCases(markdown: string): ParsedCase[] {
  const cases: ParsedCase[] = []
  const lines = markdown.split('\n')
  let currentPropositionNumber: string | null = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    // Proposition header: ## 01  Clear direction with AI
    const propMatch = line.match(/^##\s+(\d{2})\s+/)
    if (propMatch) {
      currentPropositionNumber = propMatch[1]
      i++
      continue
    }

    // Case header: ### Client Name
    const caseMatch = line.match(/^###\s+(.+)/)
    if (caseMatch && currentPropositionNumber) {
      const clientName = caseMatch[1].trim()
      i++

      // Metadata line: Sector | Date range | Proof: Level
      const metaLine = lines[i]?.trim() ?? ''
      const metaParts = metaLine.split(' | ')
      const sector = metaParts[0]?.trim() ?? ''
      const dateRange = metaParts[1]?.trim() ?? ''
      const proofRaw = metaParts[2]?.replace(/^Proof:\s*/i, '').trim() ?? 'Medium'
      const proofLevel = normalizeProofLevel(proofRaw)
      i++

      // Skip blank line after metadata
      if (lines[i]?.trim() === '') i++

      // Collect description until **Result:
      const descLines: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('**Result:')) {
        const l = lines[i].trim()
        if (l !== '') descLines.push(l)
        i++
      }

      // Parse result line: **Result: ...**
      const resultLine = lines[i]?.trim() ?? ''
      const resultMatch = resultLine.match(/^\*\*Result:\s*(.+?)\*\*$/)
      const result = resultMatch?.[1]?.trim() ?? ''
      i++

      cases.push({
        client_name: clientName,
        sector,
        date_range: dateRange,
        proof_level: proofLevel,
        description: descLines.join(' '),
        result,
        proposition_number: currentPropositionNumber,
      })
      continue
    }

    i++
  }

  return cases
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const client = createClient(url, key, { auth: { persistSession: false } })

  // Fetch proposition UUIDs
  const { data: propositions, error: propError } = await client
    .from('propositions')
    .select('id, number')
  if (propError) throw propError

  const propMap = new Map(propositions.map((p: { id: string; number: string }) => [p.number, p.id]))

  // Parse cases from markdown
  const markdown = readFileSync(join(process.cwd(), 'input/xomnia_use_cases.md'), 'utf-8')
  const parsed = parseUseCases(markdown)

  console.log(`Parsed ${parsed.length} cases from markdown`)

  // Map to DB rows
  const rows = parsed.map((c) => {
    const propositionId = propMap.get(c.proposition_number)
    if (!propositionId) throw new Error(`No proposition found for number ${c.proposition_number}`)
    return {
      client_name: c.client_name,
      sector: c.sector,
      date_range: c.date_range,
      proof_level: c.proof_level,
      description: c.description,
      result: c.result,
      proposition_id: propositionId,
      offering_id: null,
    }
  })

  // Insert in batches of 25
  const BATCH = 25
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await client.from('cases').insert(batch)
    if (error) throw error
    console.log(`Inserted cases ${i + 1}–${Math.min(i + BATCH, rows.length)}`)
  }

  console.log(`Done. ${rows.length} cases seeded.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
