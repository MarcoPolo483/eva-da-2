// src/App.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { ProjectSummary } from "./components/ProjectSummary";
import type { ProjectId } from "./lib/evaClient";

// Map each project id to a CSS theme class.
// Make sure these keys EXACTLY match the ProjectId union in evaClient.ts
// e.g. export type ProjectId = "canadaLife" | "jurisprudence" | "admin";
const projectThemeClass: Record<ProjectId, string> = {
  canadaLife: "theme-canada-life",
  jurisprudence: "theme-jurisprudence",
  admin: "theme-admin",
};

function App() {
  const { t } = useTranslation();

  // Default to Canada Life; value must be a valid ProjectId string
  const [projectId, setProjectId] = useState<ProjectId>("canadaLife");

  return (
    <div
      className={`${projectThemeClass[projectId]} min-h-screen flex flex-col`}
    >
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded shadow"
      >
        {t("skipToMain")}
      </a>

      {/* Top header with project switcher and language toggle */}
      <Header projectId={projectId} onProjectChange={setProjectId} />

      {/* Main content: chat + side panel */}
      <main
        id="main"
        className="flex-1 flex justify-center px-4 py-6"
        aria-label="EVA DA 2.0 main content"
      >
        <div className="w-full max-w-5xl flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <ChatPanel projectId={projectId} />
          </div>

          <div className="w-full lg:w-80">
            <ProjectSummary projectId={projectId} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
