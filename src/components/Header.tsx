import { useTranslation } from "react-i18next";
import type { ProjectId } from "../lib/evaClient";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  projectId: ProjectId;
  onProjectChange: (id: ProjectId) => void;
}

export function Header({ projectId, onProjectChange }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="shadow-sm">
      <div
        className="h-3"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />
      <div className="bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              {t("appTitle")}
            </span>
            <span className="text-xs text-gray-500">
              EVA DA 2.0 demo – project-aware, bilingual, accessible
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProjectSwitcher projectId={projectId} onProjectChange={onProjectChange} />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
