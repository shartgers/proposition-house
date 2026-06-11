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

// Practices source: input/practices.md (units: Strategy & Delivery, AI Solutions,
// Analytics & Data Engineering [no practices yet], Data Platforms, Trusted AI)
const SEED = [
  {
    proposition: '01',
    offerings: [
      {
        name: 'AI Board Brief',
        practice: 'Data & AI strategy',
        owner: 'TBD',
        sort: 1,
        description: 'A focused, executive-level briefing that translates AI opportunities into business value and investment decisions. Designed for boards and C-suite audiences who need clarity without the technical detail.',
        key_outcomes: 'Clear AI investment thesis, prioritised opportunity landscape, executive alignment and buy-in',
      },
      {
        name: 'Agentic Maturity Scan',
        practice: 'Data & AI strategy',
        owner: 'TBD',
        sort: 2,
        description: 'A structured assessment of your organisation\'s readiness to adopt and scale agentic AI across people, processes, data, and technology. Benchmarks current state and identifies the highest-leverage next steps.',
        key_outcomes: 'Maturity baseline, gap analysis across five capability dimensions, prioritised roadmap for agentic adoption',
      },
      {
        name: 'Phase Zero',
        practice: 'Data & AI strategy',
        owner: 'TBD',
        sort: 3,
        description: 'Xomnia\'s structured discovery and framing engagement. We define the AI problem space, validate technical and commercial feasibility, and produce an executable delivery roadmap — de-risking investment before a single line of model code is written.',
        key_outcomes: 'Validated use-case shortlist, business case with ROI model, capability assessment, and an actionable delivery roadmap',
      },
      {
        name: 'Fractional AI Leadership',
        practice: 'Data & AI strategy',
        owner: 'TBD',
        sort: 4,
        description: 'Embedded senior AI leadership — at CPO or CAIO level — on a part-time or interim basis. We guide strategy, governance, and team development while you build the internal capability to eventually own it.',
        key_outcomes: 'Strategic AI direction, accelerated decision-making, internal capability uplift, and a clear transition plan to in-house ownership',
      },
    ],
  },
  {
    proposition: '02',
    offerings: [
      {
        name: 'MLOps maturity scan',
        practice: 'GenAI & Agentic',
        owner: 'TBD',
        sort: 1,
        description: 'A diagnostic of your current ML deployment practices, infrastructure, and operational processes measured against production-grade MLOps standards. Identifies gaps slowing your ability to ship and maintain AI reliably.',
        key_outcomes: 'Maturity baseline, prioritised improvement plan, and a clear path to reliable production AI operations',
      },
      {
        name: 'AI assistants & chatbots',
        practice: 'GenAI & Agentic',
        owner: 'TBD',
        sort: 2,
        description: 'Design, build, and deploy conversational AI systems — RAG-based, LLM-powered, or hybrid — that automate high-volume customer and employee interactions with consistent accuracy.',
        key_outcomes: 'Reduced average handling time, measurable automation rate, improved user satisfaction, and production-grade conversational AI',
      },
      {
        name: 'Agents for business automation',
        practice: 'GenAI & Agentic',
        owner: 'TBD',
        sort: 3,
        description: 'End-to-end development of autonomous AI agents that execute multi-step tasks across systems and data sources. We handle integration, orchestration, and guardrails so the agent works reliably at scale.',
        key_outcomes: 'Automated business workflows, reduced manual effort, measurable throughput increase, and a governed agent operating model',
      },
      {
        name: 'AI platform + cloud engineering',
        practice: 'Custom platforms',
        owner: 'TBD',
        sort: 4,
        description: 'Design and build the secure, scalable AI infrastructure layer: model serving, data connectors, permissioned knowledge bases, and governance controls. Built on the cloud platforms your organisation already uses.',
        key_outcomes: 'Production-ready AI platform, reduced time-to-deployment for new use cases, and a governed model and data lifecycle',
      },
      {
        name: 'Custom model development',
        practice: 'GenAI & Agentic',
        owner: 'TBD',
        sort: 5,
        description: 'Bespoke machine learning and deep learning models built for problems where off-the-shelf models lack accuracy, domain coverage, or explainability. From feature engineering through to production deployment.',
        key_outcomes: 'High-accuracy, domain-specific models, measurable business impact, and production deployment with monitoring',
      },
      {
        name: 'Fine-tuning',
        practice: 'GenAI & Agentic',
        owner: 'TBD',
        sort: 6,
        description: 'Adapting pre-trained foundation models to your domain, language, or task format using your own data. Achieves better accuracy and relevance than prompt engineering alone, at lower inference cost than running large general models.',
        key_outcomes: 'Improved task performance vs. base model, reduced hallucination, cost-efficient inference at scale',
      },
    ],
  },
  {
    proposition: '03',
    offerings: [
      {
        name: 'Automation opportunity scan',
        practice: 'Agentic delivery',
        owner: 'TBD',
        sort: 1,
        description: 'A rapid, structured identification and prioritisation of automation opportunities across your business processes. Uses AI feasibility criteria and business value framing to focus effort where the return is highest.',
        key_outcomes: 'Prioritised automation backlog, ROI estimates per opportunity, and decision-ready recommendations for leadership',
      },
      {
        name: 'Intelligent workflow design',
        practice: 'Agentic delivery',
        owner: 'TBD',
        sort: 2,
        description: 'Redesigning business processes from the ground up to optimally combine human judgement and AI capability. We map current workflows, identify where AI adds value, and design the handoffs, guardrails, and exception handling.',
        key_outcomes: 'Redesigned workflows with clear human-AI task allocation, efficiency gain targets, and implementation blueprint',
      },
      {
        name: 'Agent-enabled customer service',
        practice: 'Agentic delivery',
        owner: 'TBD',
        sort: 3,
        description: 'Deploying AI agents across customer service channels — voice, chat, email — to handle high-volume interactions autonomously, reducing load on human agents while maintaining or improving service quality.',
        key_outcomes: 'Reduced average handling time, higher first-contact resolution rate, improved customer satisfaction, and lower cost per interaction',
      },
      {
        name: 'Intelligent document build',
        practice: 'Agentic delivery',
        owner: 'TBD',
        sort: 4,
        description: 'Building document intelligence pipelines that extract, classify, summarise, and route information from unstructured documents at scale. Eliminates manual document handling across intake, compliance, and reporting workflows.',
        key_outcomes: 'Automated document processing, dramatic reduction in manual review time, and higher accuracy and consistency at scale',
      },
    ],
  },
  {
    proposition: '04',
    offerings: [
      {
        name: 'Data readiness assessment',
        practice: 'Custom platforms',
        owner: 'TBD',
        sort: 1,
        description: 'A systematic evaluation of your data estate\'s quality, accessibility, lineage, and governance readiness for AI and analytics use. Gives you a clear picture of where you stand and what needs to change.',
        key_outcomes: 'Data quality baseline, gap report against AI readiness criteria, and a prioritised remediation plan',
      },
      {
        name: 'Data platform build',
        practice: 'Databricks',
        owner: 'TBD',
        sort: 2,
        description: 'Designing and building a scalable, modern data platform — typically on Databricks — that serves as the reliable foundation for analytics, reporting, and AI workloads. From architecture through to production.',
        key_outcomes: 'Production-grade data platform, unified data access layer, and significantly reduced ETL complexity',
      },
      {
        name: 'Modern Data Stack tools',
        practice: 'Fabric',
        owner: 'TBD',
        sort: 3,
        description: 'Implementing best-in-class tooling — dbt, Airbyte, Microsoft Fabric, and related open-source and SaaS components — for data transformation, ingestion, observability, and self-service analytics.',
        key_outcomes: 'Improved data reliability, faster iteration cycles for analytics teams, and reduced infrastructure overhead',
      },
      {
        name: 'AI-ready data platform',
        practice: 'Databricks',
        owner: 'TBD',
        sort: 4,
        description: 'Building a data platform specifically engineered for AI workloads: optimised for feature engineering, model training at scale, real-time inference, and governed access to sensitive data.',
        key_outcomes: 'AI-optimised data layer with feature store, reduced model development cycle time, and governed access for data science teams',
      },
      {
        name: 'Legacy modernisation',
        practice: 'IT Ops',
        owner: 'TBD',
        sort: 5,
        description: 'Migrating legacy data systems, batch pipelines, and monolithic architectures to cloud-native, event-driven designs — with minimal disruption to ongoing operations and clear rollback plans at each stage.',
        key_outcomes: 'Decommissioned legacy systems, reduced operational and licensing cost, improved platform reliability and developer velocity',
      },
    ],
  },
  {
    proposition: '05',
    offerings: [
      {
        name: 'EU AI Act audit',
        practice: 'AI governance',
        owner: 'TBD',
        sort: 1,
        description: 'An independent, structured assessment of your AI systems against EU AI Act obligations — including risk classification, prohibited use checks, documentation requirements, and conformity preparation.',
        key_outcomes: 'Risk classification report, compliance gap analysis, and a regulatory readiness plan mapped to your implementation timeline',
      },
      {
        name: 'Risk & controls audit',
        practice: 'AI governance',
        owner: 'TBD',
        sort: 2,
        description: 'A technical and process audit of production AI systems to surface model risk, data risk, and control gaps. Assessed against internal governance standards and relevant external regulations.',
        key_outcomes: 'Risk register with severity ratings, identified control gaps, and a prioritised remediation and monitoring plan',
      },
      {
        name: 'Responsible AI framework',
        practice: 'AI governance',
        owner: 'TBD',
        sort: 3,
        description: 'Designing and embedding a practical responsible AI governance framework into your organisation — covering ethics, fairness, transparency, human oversight, and accountability across the AI lifecycle.',
        key_outcomes: 'Documented governance framework, policy and process templates, internal audit capability, and a cross-functional oversight model',
      },
      {
        name: 'Open source & EU Alt models',
        practice: 'Sovereign AI',
        owner: 'TBD',
        sort: 4,
        description: 'Deploying sovereign, open-source LLMs and foundation models on EU-based infrastructure as compliant alternatives to US hyperscaler AI services. Retains data sovereignty while matching your capability requirements.',
        key_outcomes: 'Data sovereignty, reduced third-party dependency, compliant AI deployment within EU jurisdiction, and cost-controlled inference',
      },
      {
        name: 'AI risk & compliance audit',
        practice: 'AI governance',
        owner: 'TBD',
        sort: 5,
        description: 'A comprehensive, sector-specific audit of AI systems and processes against regulatory requirements — DORA, MDR, NIS2, and similar frameworks. Combines technical model review with process and documentation assessment.',
        key_outcomes: 'Regulatory gap analysis, risk-rated findings, compliance roadmap, and evidence package for regulatory submissions',
      },
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
      description: o.description ?? null,
      key_outcomes: o.key_outcomes ?? null,
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
