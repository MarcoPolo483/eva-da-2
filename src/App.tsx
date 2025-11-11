// src/App.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { ProjectRegistry } from "./components/ProjectRegistry";
import { GlobalAppAdmin } from "./components/GlobalAppAdmin";
import { AdjustModal } from "./components/AdjustModal";
import { InfoPanel } from "./components/InfoPanel";
import type { ProjectId } from "./lib/evaClient";
import { ragAnswer } from "./lib/apimClient";
import { getApimHeaders } from "./lib/apimContext";
import type { Message, RagTemplate } from "./lib/types";
import { useLocalStorage } from "./lib/useLocalStorage";
import { loadRegistry } from "./lib/projectRegistryStore";

const projectThemeClass: Record<ProjectId, string> = {
  canadaLife: "theme-canada-life",
  jurisprudence: "theme-jurisprudence",
  admin: "theme-admin"
};

// Helper to apply theme CSS variables dynamically
function applyThemeVariables(projectId: ProjectId) {
  try {
    const registry = loadRegistry<any>([]);
    const project = registry.find((p: any) => p.id === projectId);
    
    if (project && project.theme) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', project.theme.primary || '#000000');
      root.style.setProperty('--color-accent', project.theme.primary || '#000000');
      root.style.setProperty('--color-background', project.theme.background || '#ffffff');
      root.style.setProperty('--color-surface', project.theme.surface || '#ffffff');
      root.style.setProperty('--base-font-size', `${project.theme.baseFontPx || 16}px`);
      
      console.log('[App] Applied theme for', projectId, project.theme);
    }
  } catch (error) {
    console.error('[App] Failed to apply theme:', error);
  }
}

function App() {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState<ProjectId>("canadaLife");

  // Chat state lifted here to allow header-level Clear action
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [counter, setCounter] = useState(0);

  // Persist template settings across sessions
  const [template, setTemplate] = useLocalStorage<RagTemplate>(
    "eva:template",
    { temperature: 0.2, top_k: 5, source_filter: "" }
  );

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lastMetadata, setLastMetadata] = useState<any | undefined>(undefined);
  // Listen for registry updates to refresh available projects
  const [registryVersion, setRegistryVersion] = useState(0);
  
  useEffect(() => {
    const handleRegistryUpdate = () => {
      setRegistryVersion(v => v + 1);
      // Re-apply theme when registry changes (e.g., theme colors updated)
      applyThemeVariables(projectId);
    };
    
    window.addEventListener('registry-updated', handleRegistryUpdate);
    return () => window.removeEventListener('registry-updated', handleRegistryUpdate);
  }, [projectId]);

  // Apply theme variables when project changes
  useEffect(() => {
    applyThemeVariables(projectId);
  }, [projectId]);

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: counter, role: "user", text };
    setCounter((c) => c + 1);
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      // Get APIM headers from project and app context
      const headers = getApimHeaders(projectId);
      const res = await ragAnswer({ projectId, message: text, template, headers });
      const assistant: Message = { id: counter + 1, role: "assistant", text: res.answer };
      setCounter((c) => c + 2);
      setMessages((prev) => [...prev, assistant]);
      setLastMetadata(res.metadata);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => setMessages([]);

  return (
    <div className={`${projectThemeClass[projectId]} min-h-screen flex flex-col`}>
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded shadow"
      >
        {t("skipToMain")}
      </a>

      <Header
        projectId={projectId}
        onProjectChange={setProjectId}
        onClearChat={handleClear}
        onOpenAdjust={() => setAdjustOpen(true)}
        onOpenInfo={() => setInfoOpen(true)}
      />      <main id="main" className="flex-1 flex justify-center px-4 py-6" aria-label="EVA DA 2.0 main content">
        {projectId === "admin" ? (
          <div className="w-full max-w-7xl">
            <ProjectRegistry />
          </div>
        ) : projectId === "globalAdmin" ? (
          <div className="w-full max-w-7xl">
            <GlobalAppAdmin />
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <ChatPanel projectId={projectId} messages={messages} onSend={handleSend} isSending={isSending} />
          </div>
        )}
      </main>

      <AdjustModal
        open={adjustOpen}
        value={template}
        onClose={() => setAdjustOpen(false)}
        onSave={(v) => setTemplate(v)}
      />

      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} metadata={lastMetadata} template={template} />
    </div>
  );
}

export default App;
