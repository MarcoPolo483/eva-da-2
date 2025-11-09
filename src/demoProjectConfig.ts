import type { ProjectId } from "./lib/evaClient";

export interface GoldenQuestion {
  id: string;
  question: string;
  expectedPattern: string;
}

export interface ProjectConfig {
  id: ProjectId;
  name: string;
  domain: string;
  owner: string;
  costCenter: string;
  description: string;
  ragProfile: string;
  goldenQuestions: GoldenQuestion[];
}

export const projectConfigs: Record<ProjectId, ProjectConfig> = {
  canadaLife: {
    id: "canadaLife",
    name: "Canada Life EVA Assistant",
    domain: "Benefits & Insurance",
    owner: "Canada Life Integration Team",
    costCenter: "CL-7421",
    description:
      "Pilot assistant helping case workers and analysts search Canada Life onboarding and benefits documentation.",
    ragProfile: "FAQ-centric RAG over curated policy PDFs and playbooks.",
    goldenQuestions: [
      {
        id: "cl-1",
        question: "How do I onboard a new Canada Life case into EVA DA?",
        expectedPattern:
          "Answer mentions onboarding checklist, intake form, and the Canada Life starter playbook.",
      },
      {
        id: "cl-2",
        question: "Where can I find the Canada Life escalation process?",
        expectedPattern:
          "Answer points to the escalation section in the Canada Life procedures guide.",
      },
      {
        id: "cl-3",
        question: "What documentation is required before approving a claim?",
        expectedPattern:
          "Answer lists mandatory documents (ID, policy, medical evidence) and links to the validation table.",
      },
    ],
  },

  jurisprudence: {
    id: "jurisprudence",
    name: "Jurisprudence Research Assistant",
    domain: "Legal & Appeals",
    owner: "JST / Legal Services",
    costCenter: "JST-3102",
    description:
      "Assistant specialized in CPP/OAS jurisprudence, surfacing relevant precedents and case summaries.",
    ragProfile:
      "Semantic RAG across structured case summaries with filters on benefit type, issue, and outcome.",
    goldenQuestions: [
      {
        id: "jp-1",
        question:
          "Find jurisprudence related to CPP disability appeals with chronic pain as the main issue.",
        expectedPattern:
          "Answer includes 2–3 key cases with neutral citations and a one-line summary for each.",
      },
      {
        id: "jp-2",
        question:
          "What factors are typically considered when assessing 'severe and prolonged' disability?",
        expectedPattern:
          "Answer outlines the legal test: capacity for regular substantially gainful employment, duration, and functional limitations.",
      },
      {
        id: "jp-3",
        question:
          "List recent cases where benefits were denied due to insufficient medical evidence.",
        expectedPattern:
          "Answer names a few cases and highlights the missing elements (specialist reports, longitudinal records).",
      },
    ],
  },

  admin: {
    id: "admin",
    name: "EVA DA Admin Workspace",
    domain: "Platform / AICOE",
    owner: "AI Centre of Enablement (AICOE)",
    costCenter: "AICOE-0001",
    description:
      "Internal view used to manage EVA DA projects, RAG profiles, and monitoring hooks.",
    ragProfile:
      "Metadata-driven RAG over internal runbooks, architecture decisions, and operating procedures.",
    goldenQuestions: [
      {
        id: "ad-1",
        question: "What are the onboarding steps for a new EVA DA project?",
        expectedPattern:
          "Answer lists discovery, data curation, RAG profile definition, guardrails, and go-live checklist.",
      },
      {
        id: "ad-2",
        question:
          "Which logs should be monitored to detect potential privacy incidents in EVA DA?",
        expectedPattern:
          "Answer mentions APIM logs, application telemetry, and SIEM alerts for anomalous patterns.",
      },
      {
        id: "ad-3",
        question:
          "How do we register a new EVA DA project and associate it with a cost centre?",
        expectedPattern:
          "Answer references the project register, required metadata (owner, cost centre, data domain), and approval steps.",
      },
    ],
  },
};
