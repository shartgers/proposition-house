export type DemoProject = {
  id: string;
  name: string;
  domain: string;
  description: string;
  updatedAt: string;
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
};

export type DemoUser = {
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Business";
};

export const demoUser: DemoUser = {
  name: "Alex Morgan",
  email: "alex@example.com",
  plan: "Free",
};

export const initialProjects: DemoProject[] = [
  {
    id: "1",
    name: "Mobile Banking App",
    domain: "Fintech",
    description:
      "Consumer mobile app for transfers, bill pay, and spending insights.",
    updatedAt: "2026-06-08T14:30:00.000Z",
    progress: { total: 6, completed: 4, percentage: 67 },
  },
  {
    id: "2",
    name: "HR Onboarding Portal",
    domain: "Enterprise SaaS",
    description:
      "Self-serve onboarding workflow for new hires with document collection.",
    updatedAt: "2026-06-05T09:15:00.000Z",
    progress: { total: 6, completed: 2, percentage: 33 },
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    domain: "B2B Analytics",
    description:
      "Executive overview of KPIs, cohort trends, and exportable reports.",
    updatedAt: "2026-06-01T18:45:00.000Z",
    progress: { total: 6, completed: 6, percentage: 100 },
  },
];
