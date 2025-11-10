// src/components/ProjectRegistry.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ProjectId } from "../lib/evaClient";
import type { ApimConfig } from "../lib/apimConfig";
import { defaultLocalConfig, defaultAzureConfig } from "../lib/apimConfig";
import {
  loadRegistry,
  saveRegistry,
  exportRegistry,
  importRegistry
} from "../lib/projectRegistryStore";

interface ThemeConfig {
  primary: string;
  background: string;
  surface: string;
  baseFontPx: number;
}

interface RagIndexConfig {
  chunkingStrategy: string;
  chunkSizeTokens: number;
  overlapTokens: number;
  indexName: string;
}

interface RagRetrievalConfig {
  rankingStrategy: string;
  topK: number;
  citationStyle: string;
}

interface GuardrailConfig {
  piiRedaction: boolean;
  speculativeAnswers: boolean;
  blockedTopicsSummary: string;
}

interface SuggestedQuestion {
  en: string;
  fr: string;
}

interface RegistryEntry {
  id: ProjectId;
  label: string;
  domain: string;
  owner: string;
  costCentre: string;
  ragProfile: string;
  description: string;

  theme: ThemeConfig;
  ragIndex: RagIndexConfig;
  ragRetrieval: RagRetrievalConfig;
  guardrails: GuardrailConfig;
  suggestedQuestions: SuggestedQuestion[];
  apim: ApimConfig;
}

// Demo registry data + UI/back-end attributes that could be driven from UI
const REGISTRY: RegistryEntry[] = [
  {
    id: "canadaLife",
    label: "Canada Life EVA Assistant",
    domain: "Benefits & Insurance",
    owner: "Canada Life Integration Team",
    costCentre: "CL-7421",
    ragProfile: "FAQ-centric RAG over curated policy PDFs and playbooks.",
    description:
      "Pilot assistant helping case workers and analysts search Canada Life onboarding and benefits documentation.",
    theme: {
      primary: "#e41d3d",
      background: "#fff5f5",
      surface: "#ffffff",
      baseFontPx: 18
    },
    ragIndex: {
      chunkingStrategy: "semantic",
      chunkSizeTokens: 600,
      overlapTokens: 80,
      indexName: "rag-index-canada-life"
    },
    ragRetrieval: {
      rankingStrategy: "hybrid",
      topK: 8,
      citationStyle: "inline"
    },
    guardrails: {
      piiRedaction: true,
      speculativeAnswers: false,
      blockedTopicsSummary: "Blocks medical diagnosis and personal financial advice."
    },    suggestedQuestions: [
      {
        en: "How do I onboard a new Canada Life case into EVA DA?",
        fr: "Comment intégrer un nouveau dossier Canada Vie dans EVA DA ?"
      },
      {
        en: "Where can I find the Canada Life escalation process?",
        fr: "Où trouver le processus d'escalade Canada Vie ?"
      },
      {
        en: "What are the eligibility rules for term employees?",
        fr: "Quelles sont les règles d'éligibilité pour les employés temporaires ?"
      }
    ],
    apim: {
      ...defaultLocalConfig,
      features: {
        ...defaultLocalConfig.features,
        enableCache: true // Enable caching for Canada Life responses
      }
    }
  },
  {
    id: "jurisprudence",
    label: "Jurisprudence Research Assistant",
    domain: "Legal / Jurisprudence",
    owner: "Legal Services",
    costCentre: "JUR-9001",
    ragProfile:
      "Case-law-centric RAG over curated jurisprudence decisions and summaries.",
    description:
      "Assistant to help legal analysts and advisors research CPP-D and related jurisprudence.",
    theme: {
      primary: "#0055a4",
      background: "#f5f8ff",
      surface: "#ffffff",
      baseFontPx: 18
    },
    ragIndex: {
      chunkingStrategy: "markdown",
      chunkSizeTokens: 700,
      overlapTokens: 100,
      indexName: "rag-index-jurisprudence"
    },
    ragRetrieval: {
      rankingStrategy: "semantic",
      topK: 5,
      citationStyle: "footnote"
    },
    guardrails: {
      piiRedaction: true,
      speculativeAnswers: false,
      blockedTopicsSummary: "Disallows personal legal advice; forces citations to case law."
    },    suggestedQuestions: [
      {
        en: "Summarize the leading CPP-D chronic pain decision.",
        fr: "Résumez la décision phare CPP-D sur la douleur chronique."
      },
      {
        en: "Which cases define a severe and prolonged disability?",
        fr: "Quelles affaires définissent une invalidité grave et prolongée ?"
      },
      {
        en: "List recent jurisprudence related to CPP-D appeals.",
        fr: "Listez la jurisprudence récente liée aux appels CPP-D."
      }
    ],
    apim: {
      ...defaultLocalConfig,
      features: {
        ...defaultLocalConfig.features,
        enableTracing: false // Disable tracing for sensitive legal content
      }
    }
  },
  {
    id: "admin",
    label: "EVA DA Admin Workspace",
    domain: "Platform / AICOE",
    owner: "AI Centre of Enablement",
    costCentre: "AICOE-0001",
    ragProfile:
      "Metadata-driven RAG over internal runbooks, architecture decisions, and operating procedures.",
    description:
      "Internal workspace used to manage EVA DA projects, RAG profiles, and monitoring information.",
    theme: {
      primary: "#000000",
      background: "#f4f4f4",
      surface: "#ffffff",
      baseFontPx: 16
    },
    ragIndex: {
      chunkingStrategy: "semantic",
      chunkSizeTokens: 500,
      overlapTokens: 80,
      indexName: "eva-da-admin-index"
    },
    ragRetrieval: {
      rankingStrategy: "hybrid",
      topK: 6,
      citationStyle: "inline"
    },
    guardrails: {
      piiRedaction: true,
      speculativeAnswers: false,
      blockedTopicsSummary: "Internal-only; logs prompts and answers for monitoring."
    },    suggestedQuestions: [],
    apim: {
      ...defaultAzureConfig,
      apiEndpoint: "https://eva-da-admin.azure-api.net/eva/v1",
      apiVersion: "2023-11-09",
      subscriptionKey: import.meta.env.ADMIN_APIM_KEY || "",
      features: {
        enableMetrics: true,
        enableTracing: true,
        enableCache: false
      }
    }
  }
];

// Helper: lookup by id for fast access
const registryById: Record<ProjectId, RegistryEntry> = REGISTRY.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<ProjectId, RegistryEntry>
);

export { registryById };

export function ProjectRegistry() {
  const { t } = useTranslation();
  // Load persisted registry from localStorage (falls back to built-in defaults)
  const [entries, setEntries] = useState<RegistryEntry[]>(() =>
    loadRegistry<RegistryEntry>(REGISTRY)
  );

  const initialProjectId: ProjectId = entries[0]?.id ?? "canadaLife";
  const [selectedProjectId, setSelectedProjectId] =
    useState<ProjectId>(initialProjectId);

  // Accordion open/close state – we make Look & feel actually expandable
  const [showLookAndFeelDetails, setShowLookAndFeelDetails] =
    useState<boolean>(true);

  const project = entries.find((e) => e.id === selectedProjectId) ?? entries[0];
  
  // Local draft state for the current project's edits
  const [draftProject, setDraftProject] = useState<RegistryEntry | null>(null);
  
  // Reset draft when selection changes
  useEffect(() => {
    setDraftProject(null);
  }, [selectedProjectId]);
  // Get the active project data (draft or original)
  const activeProject = draftProject ?? project;
  const theme = activeProject?.theme ?? {
    primary: "#000000",
    background: "#ffffff",
    surface: "#ffffff",
    baseFontPx: 16
  };

  // Helpers: CRUD actions
  function handleSave() {
    if (!draftProject) return; // Nothing to save
    
    const updated = entries.map((e) => 
      e.id === selectedProjectId ? draftProject : e
    );
    
    const ok = saveRegistry(updated);
    if (ok) {
      setEntries(updated);
      setDraftProject(null);
      // Trigger a custom event to notify App.tsx of registry changes
      window.dispatchEvent(new CustomEvent('registry-updated'));
      alert("Project registry saved to localStorage.");
    } else {
      alert("Failed to save registry. See console for details.");
    }
  }

  // Field update helper
  function updateField(field: keyof RegistryEntry, value: any) {
    if (!project) return;
    const draft = draftProject ?? { ...project };
    setDraftProject({ ...draft, [field]: value });
  }

  function handleCreateNew() {
    const id = prompt("New project id (short, no spaces)");
    if (!id) return;
    const normalized = id.trim().replace(/\s+/g, "");
    if (entries.some((e) => e.id === normalized)) {
      // eslint-disable-next-line no-alert
      alert("A project with that id already exists.");
      return;
    }    const newEntry: RegistryEntry = {
      id: normalized as ProjectId,
      label: `New project ${normalized}`,
      domain: "",
      owner: "",
      costCentre: "",
      ragProfile: "",
      description: "",
      theme: { primary: "#0b74de", background: "#ffffff", surface: "#ffffff", baseFontPx: 16 },
      ragIndex: { chunkingStrategy: "semantic", chunkSizeTokens: 500, overlapTokens: 80, indexName: `${normalized}-index` },      ragRetrieval: { rankingStrategy: "semantic", topK: 6, citationStyle: "inline" },
      guardrails: { piiRedaction: true, speculativeAnswers: false, blockedTopicsSummary: "" },
      suggestedQuestions: [
        { en: `Sample question 1 for ${normalized}`, fr: `Question exemple 1 pour ${normalized}` },
        { en: `Sample question 2 for ${normalized}`, fr: `Question exemple 2 pour ${normalized}` },
        { en: `Sample question 3 for ${normalized}`, fr: `Question exemple 3 pour ${normalized}` }
      ],
      apim: { ...defaultLocalConfig }
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    setSelectedProjectId(newEntry.id);
  }

  function handleDelete(id: ProjectId) {
    if (!confirm(`Delete project ${id}? This cannot be undone.`)) return;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveRegistry(updated);
    setSelectedProjectId(updated[0]?.id ?? ("canadaLife" as ProjectId));
  }

  function handleExport() {
    const text = exportRegistry(entries);
    // Trigger download by opening in new tab as data URL (simple)
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eva-project-registry.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const raw = prompt("Paste registry JSON here to import (will replace current registry)");
    if (!raw) return;
    const imported = importRegistry<RegistryEntry>(raw);
    if (!imported) {
      // eslint-disable-next-line no-alert
      alert("Invalid JSON payload — import failed.");
      return;
    }
    setEntries(imported);
    saveRegistry(imported);
    // eslint-disable-next-line no-alert
    alert("Registry imported and saved.");
  }

  function handleReset() {
    if (!confirm("Reset registry to defaults? This will clear all custom projects and cannot be undone.")) return;
    localStorage.removeItem('eva:projectRegistry');
    alert("Registry will reset to defaults. Page will reload.");
    setTimeout(() => window.location.reload(), 500);
  }

  return (
    <section aria-label="Project register administration">
      {/* Top heading + description */}
      <header className="mb-4">
        <p className="text-xs text-gray-600 mb-1">
          EVA DA 2.0 demo – project-aware, bilingual, accessible
        </p>
        <h1 className="text-2xl font-semibold">
          Project Register Administration
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure project-aware assistants for EVA Domain Assistant. These
          attributes can be changed in the UI so project spaces evolve without
          code changes in the backend.
        </p>
      </header>

      {/* Project selector row + action buttons */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label
            htmlFor="registry-project"
            className="text-sm font-medium text-gray-700"
          >
            Project:
          </label>
          <select
            id="registry-project"
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value as ProjectId)
            }
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {t(`project.${e.id}`) || e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} className="rounded bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white">
            Save
          </button>
          <button onClick={handleCreateNew} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            New
          </button>
          <button onClick={() => handleDelete(selectedProjectId)} className="rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700">
            Delete
          </button>
          <button onClick={handleExport} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            Export
          </button>
          <button onClick={handleImport} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            Import
          </button>
          <button onClick={handleReset} className="rounded border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-700">
            Reset
          </button>
        </div>
      </div>

      {/* CATEGORY BOXES: Business, RAG engine, Guardrails, Look & feel */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Business / registry metadata */}
        <div className="rounded border border-gray-200 bg-[var(--color-surface)]">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 bg-gray-50"
          >
            <span>Business / Project metadata</span>
            <span className="text-xs text-gray-500">static mock accordion</span>
          </button>
          <div className="px-4 py-3">
            <form className="space-y-3">
              {/* Basic info */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Project name</label>
                <input
                  type="text"
                  value={activeProject.label}
                  onChange={(e) => updateField("label", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Domain</label>
                <input
                  type="text"
                  value={activeProject.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Owner</label>
                <input
                  type="text"
                  value={activeProject.owner}
                  onChange={(e) => updateField("owner", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Cost centre</label>
                <input
                  type="text"
                  value={activeProject.costCentre}
                  onChange={(e) => updateField("costCentre", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600">RAG profile</label>
                <textarea
                  value={activeProject.ragProfile}
                  onChange={(e) => updateField("ragProfile", e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  value={activeProject.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </form>

            <p className="mt-4 text-xs text-gray-600">
              These values live in the project register, not the code, so
              business ownership and cost centre mapping can change over time.
            </p>
          </div>
        </div>

        {/* 2. RAG engine configuration */}
        <div className="rounded border border-gray-200 bg-[var(--color-surface)]">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 bg-gray-50"
          >
            <span>RAG engine configuration</span>
            <span className="text-xs text-gray-500">index + retrieval</span>
          </button>
          <div className="px-4 py-3 text-sm">
            <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Indexing
            </div>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Chunking Strategy</label>
                <select
                  value={activeProject.ragIndex.chunkingStrategy}
                  onChange={(e) => updateField("ragIndex", { ...activeProject.ragIndex, chunkingStrategy: e.target.value })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <option value="semantic">Semantic</option>
                  <option value="markdown">Markdown-aware</option>
                  <option value="fixedLength">Fixed Length</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Chunk Size (tokens)</label>
                <input
                  type="number"
                  value={activeProject.ragIndex.chunkSizeTokens}
                  onChange={(e) => updateField("ragIndex", { ...activeProject.ragIndex, chunkSizeTokens: parseInt(e.target.value, 10) })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Overlap (tokens)</label>
                <input
                  type="number"
                  value={activeProject.ragIndex.overlapTokens}
                  onChange={(e) => updateField("ragIndex", { ...activeProject.ragIndex, overlapTokens: parseInt(e.target.value, 10) })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Index Name</label>
                <input
                  type="text"
                  value={activeProject.ragIndex.indexName}
                  onChange={(e) => updateField("ragIndex", { ...activeProject.ragIndex, indexName: e.target.value })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </form>

            <div className="mt-6 mb-2 text-xs font-semibold uppercase text-gray-500">
              Retrieval
            </div>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Ranking Strategy</label>
                <select
                  value={activeProject.ragRetrieval.rankingStrategy}
                  onChange={(e) => updateField("ragRetrieval", { ...activeProject.ragRetrieval, rankingStrategy: e.target.value })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <option value="semantic">Semantic</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="bm25">BM25</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Top-K Results</label>
                <input
                  type="number"
                  value={activeProject.ragRetrieval.topK}
                  onChange={(e) => updateField("ragRetrieval", { ...activeProject.ragRetrieval, topK: parseInt(e.target.value, 10) })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Citation Style</label>
                <select
                  value={activeProject.ragRetrieval.citationStyle}
                  onChange={(e) => updateField("ragRetrieval", { ...activeProject.ragRetrieval, citationStyle: e.target.value })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <option value="inline">Inline</option>
                  <option value="footnote">Footnote</option>
                  <option value="endnote">Endnote</option>
                </select>
              </div>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              These knobs control how the shared RAG engine behaves for each
              project and can be tuned without redeploying the backend.
            </p>
          </div>
        </div>

        {/* 3. APIM Configuration */}
        <div className="rounded border border-gray-200 bg-[var(--color-surface)]">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 bg-gray-50"
          >
            <span>APIM Configuration</span>
            <span className={`text-xs ${project.apim.mode === 'azure' ? 'text-blue-600' : 'text-gray-500'}`}>
              {project.apim.mode === 'azure' ? 'Azure APIM' : 'Local Mock'}
            </span>
          </button>
          <div className="px-4 py-3 text-sm">
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Mode</label>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={activeProject.apim.mode}
                    onChange={(e) => {
                      const newMode = e.target.value as 'local' | 'azure';
                      const baseConfig = newMode === 'local' ? defaultLocalConfig : defaultAzureConfig;
                      updateField("apim", { 
                        ...activeProject.apim,
                        ...baseConfig,
                        // Preserve features from current config
                        features: activeProject.apim.features
                      });
                    }}
                    className="block rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  >
                    <option value="local">Local Mock</option>
                    <option value="azure">Azure APIM</option>
                  </select>
                </div>
              </div>

              {activeProject.apim.mode === 'local' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Local Port</label>
                  <input
                    type="number"
                    value={activeProject.apim.localPort}
                    onChange={(e) => updateField("apim", { ...activeProject.apim, localPort: parseInt(e.target.value, 10) })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">API Endpoint</label>
                    <input
                      type="url"
                      value={activeProject.apim.apiEndpoint}
                      onChange={(e) => updateField("apim", { ...activeProject.apim, apiEndpoint: e.target.value })}
                      className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="https://your-apim.azure-api.net/eva/v1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">API Version</label>
                    <input
                      type="text"
                      value={activeProject.apim.apiVersion}
                      onChange={(e) => updateField("apim", { ...activeProject.apim, apiVersion: e.target.value })}
                      className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="2023-11-09"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Region</label>
                    <input
                      type="text"
                      value={activeProject.apim.subscriptionRegion}
                      onChange={(e) => updateField("apim", { ...activeProject.apim, subscriptionRegion: e.target.value })}
                      className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="eastus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Subscription Key</label>
                    <input
                      type="password"
                      value={activeProject.apim.subscriptionKey || ''}
                      onChange={(e) => updateField("apim", { ...activeProject.apim, subscriptionKey: e.target.value })}
                      className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="Enter your APIM subscription key"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Features</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeProject.apim.features?.enableMetrics ?? false}
                      onChange={(e) => updateField("apim", {
                        ...activeProject.apim,
                        features: { ...activeProject.apim.features, enableMetrics: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <span className="text-sm text-gray-600">Metrics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeProject.apim.features?.enableTracing ?? false}
                      onChange={(e) => updateField("apim", {
                        ...activeProject.apim,
                        features: { ...activeProject.apim.features, enableTracing: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <span className="text-sm text-gray-600">Tracing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeProject.apim.features?.enableCache ?? false}
                      onChange={(e) => updateField("apim", {
                        ...activeProject.apim,
                        features: { ...activeProject.apim.features, enableCache: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <span className="text-sm text-gray-600">Cache</span>
                  </label>
                </div>
              </div>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              {activeProject.apim.mode === 'local' 
                ? "Using local mock APIM for development. Switch to Azure APIM for production deployment." 
                : "Connected to Azure APIM. Configure subscription key and features in project settings."}
            </p>
          </div>
        </div>

        {/* 4. Guardrails & governance */}
        <div className="rounded border border-gray-200 bg-[var(--color-surface)]">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 bg-gray-50"
          >
            <span>Guardrails &amp; governance</span>
            <span className="text-xs text-gray-500">
              policy-driven behaviour
            </span>
          </button>
          <div className="px-4 py-3 text-sm">
            <form className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600" htmlFor="pii-redaction">
                    PII Redaction
                  </label>
                  <div className="relative inline-block">
                    <input
                      type="checkbox"
                      id="pii-redaction"
                      checked={activeProject.guardrails.piiRedaction}
                      onChange={(e) => updateField("guardrails", { 
                        ...activeProject.guardrails, 
                        piiRedaction: e.target.checked 
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, personal identifying information will be automatically redacted from responses
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600" htmlFor="speculative-answers">
                    Speculative Answers
                  </label>
                  <div className="relative inline-block">
                    <input
                      type="checkbox"
                      id="speculative-answers"
                      checked={activeProject.guardrails.speculativeAnswers}
                      onChange={(e) => updateField("guardrails", { 
                        ...activeProject.guardrails, 
                        speculativeAnswers: e.target.checked 
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Allow responses to include educated guesses when information is incomplete
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600" htmlFor="blocked-topics">
                  Blocked Topics Summary
                </label>
                <textarea
                  id="blocked-topics"
                  value={activeProject.guardrails.blockedTopicsSummary}
                  onChange={(e) => updateField("guardrails", { 
                    ...activeProject.guardrails, 
                    blockedTopicsSummary: e.target.value 
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="Enter blocked topics and content restrictions..."
                />
                <p className="text-xs text-gray-500">
                  Summarize which topics and types of content should be blocked by the assistant
                </p>
              </div>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              These safety policies are projected into each assistant and can be
              configured per project in the registry without code changes.
            </p>
          </div>
        </div>

        {/* 4. Look & feel (REAL accordion: expand/collapse details) */}
        <div className="rounded border border-gray-200 bg-[var(--color-surface)]">
          <button
            type="button"
            onClick={() =>
              setShowLookAndFeelDetails((open) => !open)
            }
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 bg-gray-50"
          >
            <span>Look &amp; feel (theme)</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              {showLookAndFeelDetails ? "Hide details" : "Show details"}
              <span aria-hidden="true">
                {showLookAndFeelDetails ? "▾" : "▸"}
              </span>
            </span>
          </button>

          <div className="px-4 py-3 text-sm">
            {/* Always-visible summary */}
            <dl className="grid grid-cols-[auto,1fr] gap-y-1.5 gap-x-2 mb-3">
              <dt className="font-medium text-gray-600">Primary colour</dt>
              <dd>{theme.primary}</dd>

              <dt className="font-medium text-gray-600">
                Background colour
              </dt>
              <dd>{theme.background}</dd>
            </dl>

            {/* Accordion details */}
            {showLookAndFeelDetails && (
              <>
                <form className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Surface Color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.surface}
                        onChange={(e) => updateField("theme", { 
                          ...theme, 
                          surface: e.target.value 
                        })}
                        className="h-8 w-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.surface}
                        onChange={(e) => updateField("theme", { 
                          ...theme, 
                          surface: e.target.value 
                        })}
                        className="flex-1 rounded border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Base Font Size
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={theme.baseFontPx}
                        onChange={(e) => updateField("theme", { 
                          ...theme, 
                          baseFontPx: parseInt(e.target.value, 10)
                        })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {theme.baseFontPx}px
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded border border-gray-200 bg-white/60 p-2 text-xs text-gray-600">
                      <div className="mb-1">Primary / Accent</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.primary}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            primary: e.target.value 
                          })}
                          className="h-8 w-8 rounded cursor-pointer"
                          style={{ opacity: 0.85 }}
                        />
                        <input
                          type="text"
                          value={theme.primary}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            primary: e.target.value 
                          })}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded border border-gray-200 bg-white/60 p-2 text-xs text-gray-600">
                      <div className="mb-1">Background</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.background}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            background: e.target.value 
                          })}
                          className="h-8 w-8 rounded cursor-pointer"
                          style={{ opacity: 0.7 }}
                        />
                        <input
                          type="text"
                          value={theme.background}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            background: e.target.value 
                          })}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded border border-gray-200 bg-white/60 p-2 text-xs text-gray-600">
                      <div className="mb-1">Surface / Cards</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.surface}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            surface: e.target.value 
                          })}
                          className="h-8 w-8 rounded cursor-pointer"
                          style={{ opacity: 0.9 }}
                        />
                        <input
                          type="text"
                          value={theme.surface}
                          onChange={(e) => updateField("theme", { 
                            ...theme, 
                            surface: e.target.value 
                          })}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </form>

                <p className="text-xs text-gray-600">
                  These controls allow you to customize the visual theme of the assistant UI. 
                  Use the color pickers or enter hex values directly. Changes preview immediately
                  but require saving to take effect.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
