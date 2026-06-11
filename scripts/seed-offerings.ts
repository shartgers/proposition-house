// Seed practices and offerings from the mock-data source of truth.
// Safe to re-run — truncates both tables first (offerings before practices due to FK).
//
// Run: npx tsx scripts/seed-offerings.ts

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

try {
  readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
      if (m) process.env[m[1]] = m[2].trim()
    })
} catch {}

const SEED = [
  {
    proposition: '01',
    offerings: [
      { name: 'AI Board Brief', practice: 'AI Strategy', owner: 'Arnoud van Wijk', sort: 1 },
      { name: 'Agentic Maturity Scan', practice: 'AI Strategy', owner: 'Arnoud van Wijk', sort: 2 },
      { name: 'Phase Zero', practice: 'AI Strategy', owner: 'Arnoud van Wijk', sort: 3 },
      { name: 'Fractional AI Leadership', practice: 'AI Strategy', owner: 'Arnoud van Wijk', sort: 4 },
    ],
  },
  {
    proposition: '02',
    offerings: [
      { name: 'MLOps maturity scan', practice: 'ML Engineering', owner: 'Bart de Vries', sort: 1 },
      { name: 'AI assistants & chatbots', practice: 'ML Engineering', owner: 'Bart de Vries', sort: 2 },
      { name: 'Agents for business automation', practice: 'ML Engineering', owner: 'Bart de Vries', sort: 3 },
      { name: 'AI platform + cloud engineering', practice: 'Cloud & Platform', owner: 'Chris Janssen', sort: 4 },
      { name: 'Custom model development', practice: 'ML Engineering', owner: 'Bart de Vries', sort: 5 },
      { name: 'Fine-tuning', practice: 'ML Engineering', owner: 'Bart de Vries', sort: 6 },
    ],
  },
  {
    proposition: '03',
    offerings: [
      { name: 'Automation opportunity scan', practice: 'Process Intelligence', owner: 'Diana Smit', sort: 1 },
      { name: 'Intelligent workflow design', practice: 'Process Intelligence', owner: 'Diana Smit', sort: 2 },
      { name: 'Agent-enabled customer service', practice: 'Process Intelligence', owner: 'Diana Smit', sort: 3 },
      { name: 'Intelligent document build', practice: 'Process Intelligence', owner: 'Diana Smit', sort: 4 },
    ],
  },
  {
    proposition: '04',
    offerings: [
      { name: 'Data readiness assessment', practice: 'Data Engineering', owner: 'Erik Bakker', sort: 1 },
      { name: 'Data platform build', practice: 'Data Engineering', owner: 'Erik Bakker', sort: 2 },
      { name: 'Modern Data Stack tools', practice: 'Data Engineering', owner: 'Erik Bakker', sort: 3 },
      { name: 'AI-ready data platform', practice: 'Data Engineering', owner: 'Erik Bakker', sort: 4 },
      { name: 'Legacy modernisation', practice: 'Data Engineering', owner: 'Erik Bakker', sort: 5 },
    ],
  },
  {
    proposition: '05',
    offerings: [
      { name: 'EU AI Act audit', practice: 'Responsible AI', owner: 'Femke de Jong', sort: 1 },
      { name: 'Risk & controls audit', practice: 'Responsible AI', owner: 'Femke de Jong', sort: 2 },
      { name: 'Responsible AI framework', practice: 'Responsible AI', owner: 'Femke de Jong', sort: 3 },
      { name: 'Open source & EU Alt models', practice: 'Responsible AI', owner: 'Femke de Jong', sort: 4 },
      { name: 'AI risk & compliance audit', practice: 'Responsible AI', owner: 'Femke de Jong', sort: 5 },
    ],
  },
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const client = createClient(url, key, { auth: { persistSession: false } })

  // Clear in FK order
  const { error: e1 } = await client.from('offerings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e1) throw e1
  const { error: e2 } = await client.from('practices').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e2) throw e2
  console.log('Cleared offerings and practices')

  // Collect unique practices
  const uniquePractices = new Map<string, string>()
  for (const prop of SEED) {
    for (const o of prop.offerings) {
      uniquePractices.set(o.practice, o.owner)
    }
  }

  // Insert practices, collect name → id map
  const practiceRows = Array.from(uniquePractices.entries()).map(([name, practice_owner]) => ({
    name,
    practice_owner,
  }))
  const { data: insertedPractices, error: e3 } = await client
    .from('practices')
    .insert(practiceRows)
    .select('id, name')
  if (e3) throw e3
  const practiceMap = new Map(insertedPractices.map((p: { id: string; name: string }) => [p.name, p.id]))
  console.log(`Inserted ${practiceRows.length} practices`)

  // Fetch proposition UUIDs
  const { data: propositions, error: e4 } = await client.from('propositions').select('id, number')
  if (e4) throw e4
  const propMap = new Map(propositions.map((p: { id: string; number: string }) => [p.number, p.id]))

  // Insert offerings
  const offeringRows = SEED.flatMap((prop) =>
    prop.offerings.map((o) => ({
      name: o.name,
      sort_order: o.sort,
      proposition_id: propMap.get(prop.proposition),
      practice_id: practiceMap.get(o.practice),
    }))
  )
  const { error: e5 } = await client.from('offerings').insert(offeringRows)
  if (e5) throw e5
  console.log(`Inserted ${offeringRows.length} offerings`)

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
