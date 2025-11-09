import React from "react";
import { useTranslation } from "react-i18next";
import type { ProjectId } from "../lib/evaClient";

interface Props {
  projectId: ProjectId;
  onProjectChange: (id: ProjectId) => void;
}

export function ProjectSwitcher({ projectId, onProjectChange }: Props) {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onProjectChange(e.target.value as ProjectId);
  };

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <span>{t("projectSelector.label", "Project")}:</span>
      <select
        value={projectId}
        onChange={handleChange}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      >
        <option value="canadaLife">{t("project.canadaLife")}</option>
        <option value="jurisprudence">{t("project.jurisprudence")}</option>
        <option value="admin">{t("project.admin")}</option>
      </select>
    </label>
  );
}
