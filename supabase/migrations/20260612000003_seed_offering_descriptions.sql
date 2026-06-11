-- Populate description and key_outcomes for all 24 seeded offerings.
-- Matches by name + proposition number to avoid UUID dependency.

-- 01 Clear direction with AI

UPDATE offerings SET
  description    = 'A focused, executive-level briefing that translates AI opportunities into business value and investment decisions. Designed for boards and C-suite audiences who need clarity without the technical detail.',
  key_outcomes   = 'Clear AI investment thesis, prioritised opportunity landscape, executive alignment and buy-in'
WHERE name = 'AI Board Brief'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '01');

UPDATE offerings SET
  description    = 'A structured assessment of your organisation''s readiness to adopt and scale agentic AI across people, processes, data, and technology. Benchmarks current state and identifies the highest-leverage next steps.',
  key_outcomes   = 'Maturity baseline, gap analysis across five capability dimensions, prioritised roadmap for agentic adoption'
WHERE name = 'Agentic Maturity Scan'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '01');

UPDATE offerings SET
  description    = 'Xomnia''s structured discovery and framing engagement. We define the AI problem space, validate technical and commercial feasibility, and produce an executable delivery roadmap — de-risking investment before a single line of model code is written.',
  key_outcomes   = 'Validated use-case shortlist, business case with ROI model, capability assessment, and an actionable delivery roadmap'
WHERE name = 'Phase Zero'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '01');

UPDATE offerings SET
  description    = 'Embedded senior AI leadership — at CPO or CAIO level — on a part-time or interim basis. We guide strategy, governance, and team development while you build the internal capability to eventually own it.',
  key_outcomes   = 'Strategic AI direction, accelerated decision-making, internal capability uplift, and a clear transition plan to in-house ownership'
WHERE name = 'Fractional AI Leadership'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '01');

-- 02 AI and Agentic Solutions

UPDATE offerings SET
  description    = 'A diagnostic of your current ML deployment practices, infrastructure, and operational processes measured against production-grade MLOps standards. Identifies gaps slowing your ability to ship and maintain AI reliably.',
  key_outcomes   = 'Maturity baseline, prioritised improvement plan, and a clear path to reliable production AI operations'
WHERE name = 'MLOps maturity scan'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

UPDATE offerings SET
  description    = 'Design, build, and deploy conversational AI systems — RAG-based, LLM-powered, or hybrid — that automate high-volume customer and employee interactions with consistent accuracy.',
  key_outcomes   = 'Reduced average handling time, measurable automation rate, improved user satisfaction, and production-grade conversational AI'
WHERE name = 'AI assistants & chatbots'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

UPDATE offerings SET
  description    = 'End-to-end development of autonomous AI agents that execute multi-step tasks across systems and data sources. We handle integration, orchestration, and guardrails so the agent works reliably at scale.',
  key_outcomes   = 'Automated business workflows, reduced manual effort, measurable throughput increase, and a governed agent operating model'
WHERE name = 'Agents for business automation'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

UPDATE offerings SET
  description    = 'Design and build the secure, scalable AI infrastructure layer: model serving, data connectors, permissioned knowledge bases, and governance controls. Built on the cloud platforms your organisation already uses.',
  key_outcomes   = 'Production-ready AI platform, reduced time-to-deployment for new use cases, and a governed model and data lifecycle'
WHERE name = 'AI platform + cloud engineering'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

UPDATE offerings SET
  description    = 'Bespoke machine learning and deep learning models built for problems where off-the-shelf models lack accuracy, domain coverage, or explainability. From feature engineering through to production deployment.',
  key_outcomes   = 'High-accuracy, domain-specific models, measurable business impact, and production deployment with monitoring'
WHERE name = 'Custom model development'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

UPDATE offerings SET
  description    = 'Adapting pre-trained foundation models to your domain, language, or task format using your own data. Achieves better accuracy and relevance than prompt engineering alone, at lower inference cost than running large general models.',
  key_outcomes   = 'Improved task performance vs. base model, reduced hallucination, cost-efficient inference at scale'
WHERE name = 'Fine-tuning'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '02');

-- 03 Intelligent Workflows

UPDATE offerings SET
  description    = 'A rapid, structured identification and prioritisation of automation opportunities across your business processes. Uses AI feasibility criteria and business value framing to focus effort where the return is highest.',
  key_outcomes   = 'Prioritised automation backlog, ROI estimates per opportunity, and decision-ready recommendations for leadership'
WHERE name = 'Automation opportunity scan'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '03');

UPDATE offerings SET
  description    = 'Redesigning business processes from the ground up to optimally combine human judgement and AI capability. We map current workflows, identify where AI adds value, and design the handoffs, guardrails, and exception handling.',
  key_outcomes   = 'Redesigned workflows with clear human-AI task allocation, efficiency gain targets, and implementation blueprint'
WHERE name = 'Intelligent workflow design'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '03');

UPDATE offerings SET
  description    = 'Deploying AI agents across customer service channels — voice, chat, email — to handle high-volume interactions autonomously, reducing load on human agents while maintaining or improving service quality.',
  key_outcomes   = 'Reduced average handling time, higher first-contact resolution rate, improved customer satisfaction, and lower cost per interaction'
WHERE name = 'Agent-enabled customer service'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '03');

UPDATE offerings SET
  description    = 'Building document intelligence pipelines that extract, classify, summarise, and route information from unstructured documents at scale. Eliminates manual document handling across intake, compliance, and reporting workflows.',
  key_outcomes   = 'Automated document processing, dramatic reduction in manual review time, and higher accuracy and consistency at scale'
WHERE name = 'Intelligent document build'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '03');

-- 04 Data Foundation

UPDATE offerings SET
  description    = 'A systematic evaluation of your data estate''s quality, accessibility, lineage, and governance readiness for AI and analytics use. Gives you a clear picture of where you stand and what needs to change.',
  key_outcomes   = 'Data quality baseline, gap report against AI readiness criteria, and a prioritised remediation plan'
WHERE name = 'Data readiness assessment'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '04');

UPDATE offerings SET
  description    = 'Designing and building a scalable, modern data platform — typically on Databricks — that serves as the reliable foundation for analytics, reporting, and AI workloads. From architecture through to production.',
  key_outcomes   = 'Production-grade data platform, unified data access layer, and significantly reduced ETL complexity'
WHERE name = 'Data platform build'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '04');

UPDATE offerings SET
  description    = 'Implementing best-in-class tooling — dbt, Airbyte, Microsoft Fabric, and related open-source and SaaS components — for data transformation, ingestion, observability, and self-service analytics.',
  key_outcomes   = 'Improved data reliability, faster iteration cycles for analytics teams, and reduced infrastructure overhead'
WHERE name = 'Modern Data Stack tools'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '04');

UPDATE offerings SET
  description    = 'Building a data platform specifically engineered for AI workloads: optimised for feature engineering, model training at scale, real-time inference, and governed access to sensitive data.',
  key_outcomes   = 'AI-optimised data layer with feature store, reduced model development cycle time, and governed access for data science teams'
WHERE name = 'AI-ready data platform'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '04');

UPDATE offerings SET
  description    = 'Migrating legacy data systems, batch pipelines, and monolithic architectures to cloud-native, event-driven designs — with minimal disruption to ongoing operations and clear rollback plans at each stage.',
  key_outcomes   = 'Decommissioned legacy systems, reduced operational and licensing cost, improved platform reliability and developer velocity'
WHERE name = 'Legacy modernisation'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '04');

-- 05 Trusted AI

UPDATE offerings SET
  description    = 'An independent, structured assessment of your AI systems against EU AI Act obligations — including risk classification, prohibited use checks, documentation requirements, and conformity preparation.',
  key_outcomes   = 'Risk classification report, compliance gap analysis, and a regulatory readiness plan mapped to your implementation timeline'
WHERE name = 'EU AI Act audit'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '05');

UPDATE offerings SET
  description    = 'A technical and process audit of production AI systems to surface model risk, data risk, and control gaps. Assessed against internal governance standards and relevant external regulations.',
  key_outcomes   = 'Risk register with severity ratings, identified control gaps, and a prioritised remediation and monitoring plan'
WHERE name = 'Risk & controls audit'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '05');

UPDATE offerings SET
  description    = 'Designing and embedding a practical responsible AI governance framework into your organisation — covering ethics, fairness, transparency, human oversight, and accountability across the AI lifecycle.',
  key_outcomes   = 'Documented governance framework, policy and process templates, internal audit capability, and a cross-functional oversight model'
WHERE name = 'Responsible AI framework'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '05');

UPDATE offerings SET
  description    = 'Deploying sovereign, open-source LLMs and foundation models on EU-based infrastructure as compliant alternatives to US hyperscaler AI services. Retains data sovereignty while matching your capability requirements.',
  key_outcomes   = 'Data sovereignty, reduced third-party dependency, compliant AI deployment within EU jurisdiction, and cost-controlled inference'
WHERE name = 'Open source & EU Alt models'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '05');

UPDATE offerings SET
  description    = 'A comprehensive, sector-specific audit of AI systems and processes against regulatory requirements — DORA, MDR, NIS2, and similar frameworks. Combines technical model review with process and documentation assessment.',
  key_outcomes   = 'Regulatory gap analysis, risk-rated findings, compliance roadmap, and evidence package for regulatory submissions'
WHERE name = 'AI risk & compliance audit'
  AND proposition_id = (SELECT id FROM propositions WHERE number = '05');
