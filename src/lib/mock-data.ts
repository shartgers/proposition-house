// Temporary mock data — replace with Supabase queries

export type Offering = {
  id: string
  name: string
  practice: string
  practiceOwner: string
  caseCount: number
}

export type Proposition = {
  id: string
  number: string
  name: string
  offerings: Offering[]
}

export const PROPOSITIONS: Proposition[] = [
  {
    id: '01',
    number: '01',
    name: 'Clear direction with AI',
    offerings: [
      { id: '01-01', name: 'AI Board Brief', practice: 'AI Strategy', practiceOwner: 'Arnoud van Wijk', caseCount: 3 },
      { id: '01-02', name: 'Agentic Maturity Scan', practice: 'AI Strategy', practiceOwner: 'Arnoud van Wijk', caseCount: 5 },
      { id: '01-03', name: 'Phase Zero', practice: 'AI Strategy', practiceOwner: 'Arnoud van Wijk', caseCount: 12 },
      { id: '01-04', name: 'Fractional AI Leadership', practice: 'AI Strategy', practiceOwner: 'Arnoud van Wijk', caseCount: 2 },
    ],
  },
  {
    id: '02',
    number: '02',
    name: 'AI and Agentic Solutions',
    offerings: [
      { id: '02-01', name: 'MLOps maturity scan', practice: 'ML Engineering', practiceOwner: 'Bart de Vries', caseCount: 4 },
      { id: '02-02', name: 'AI assistants & chatbots', practice: 'ML Engineering', practiceOwner: 'Bart de Vries', caseCount: 8 },
      { id: '02-03', name: 'Agents for business automation', practice: 'ML Engineering', practiceOwner: 'Bart de Vries', caseCount: 6 },
      { id: '02-04', name: 'AI platform + cloud engineering', practice: 'Cloud & Platform', practiceOwner: 'Chris Janssen', caseCount: 3 },
      { id: '02-05', name: 'Custom model development', practice: 'ML Engineering', practiceOwner: 'Bart de Vries', caseCount: 2 },
      { id: '02-06', name: 'Fine-tuning', practice: 'ML Engineering', practiceOwner: 'Bart de Vries', caseCount: 1 },
    ],
  },
  {
    id: '03',
    number: '03',
    name: 'Intelligent Workflows',
    offerings: [
      { id: '03-01', name: 'Automation opportunity scan', practice: 'Process Intelligence', practiceOwner: 'Diana Smit', caseCount: 5 },
      { id: '03-02', name: 'Intelligent workflow design', practice: 'Process Intelligence', practiceOwner: 'Diana Smit', caseCount: 7 },
      { id: '03-03', name: 'Agent-enabled customer service', practice: 'Process Intelligence', practiceOwner: 'Diana Smit', caseCount: 4 },
      { id: '03-04', name: 'Intelligent document build', practice: 'Process Intelligence', practiceOwner: 'Diana Smit', caseCount: 3 },
    ],
  },
  {
    id: '04',
    number: '04',
    name: 'Data Foundation',
    offerings: [
      { id: '04-01', name: 'Data readiness assessment', practice: 'Data Engineering', practiceOwner: 'Erik Bakker', caseCount: 6 },
      { id: '04-02', name: 'Data platform build', practice: 'Data Engineering', practiceOwner: 'Erik Bakker', caseCount: 11 },
      { id: '04-03', name: 'Modern Data Stack tools', practice: 'Data Engineering', practiceOwner: 'Erik Bakker', caseCount: 8 },
      { id: '04-04', name: 'AI-ready data platform', practice: 'Data Engineering', practiceOwner: 'Erik Bakker', caseCount: 4 },
      { id: '04-05', name: 'Legacy modernisation', practice: 'Data Engineering', practiceOwner: 'Erik Bakker', caseCount: 3 },
    ],
  },
  {
    id: '05',
    number: '05',
    name: 'Trusted AI',
    offerings: [
      { id: '05-01', name: 'EU AI Act audit', practice: 'Responsible AI', practiceOwner: 'Femke de Jong', caseCount: 4 },
      { id: '05-02', name: 'Risk & controls audit', practice: 'Responsible AI', practiceOwner: 'Femke de Jong', caseCount: 3 },
      { id: '05-03', name: 'Responsible AI framework', practice: 'Responsible AI', practiceOwner: 'Femke de Jong', caseCount: 2 },
      { id: '05-04', name: 'Open source & EU Alt models', practice: 'Responsible AI', practiceOwner: 'Femke de Jong', caseCount: 1 },
      { id: '05-05', name: 'AI risk & compliance audit', practice: 'Responsible AI', practiceOwner: 'Femke de Jong', caseCount: 3 },
    ],
  },
]
