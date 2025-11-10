// src/App.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { ProjectRegistry } from "./components/ProjectRegistry";
import { AdjustModal } from "./components/AdjustModal";
import { InfoPanel } from "./components/InfoPanel";
import type { ProjectId } from "./lib/evaClient";
import { ragAnswer } from "./lib/apimClient";
import { getApimHeaders } from "./lib/apimContext";
import type { Message, RagTemplate } from "./lib/types";
import { useLocalStorage } from "./lib/useLocalStorage";

const projectThemeClass: Record<ProjectId, string> = {
  canadaLife: "theme-canada-life",
  jurisprudence: "theme-jurisprudence",
  admin: "theme-admin"
};

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
      />

      <main id="main" className="flex-1 flex justify-center px-4 py-6" aria-label="EVA DA 2.0 main content">
        {projectId === "admin" ? (
          <div className="w-full max-w-5xl">
            <ProjectRegistry />
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
