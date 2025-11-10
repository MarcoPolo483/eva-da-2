# Admin & Configuration TODOs

This file is an exported, human-readable copy of the current admin/configuration todo list for the EVA DA project. It is intended to be committed to the repository so team members and audit trails can review the planned work.

It also contains instructions for importing these todos into Azure DevOps (ADO) using the `az` CLI or by importing the provided CSV file.

---

## Overview

We split configuration into two domains:

- Project-level settings (managed by Project Admin)
- Global/app-level settings (managed by AI CoE Admin)

The planned work below implements stores, UI, RBAC, validation, and governance features to support both domains.

---

## Top-level tasks

1. Create App Config Architecture
   - Design and implement base configuration architecture
   - Create `src/lib/config` structure
   - Define interfaces and validation schemas for all domains
      - Version tracking (v0.75)

2. Implement Config Stores
   - `projectConfigStore.ts` (project-specific)
   - `appConfigStore.ts` (global/AI CoE)
   - Persistence abstraction (localStorage/file)
   - Export/import and migrations

3. Create Base Admin UI Components
   - AdminLayout with role-based navigation
   - AdminCard, EditableField, inheritance indicator components
   - Validation feedback

4. Implement Project Registry v2
   - Identity & Ownership
   - Theme & UX
   - RAG behavior, data sources, access control

5. Create AI CoE Admin Portal
   - Global settings, lifecycle control, security & compliance
   - Infra settings, pipelines, cost controls

6. Config Inheritance System
   - Override tracking
   - Reset to default / diff viewer
   - Change history

7. Role-Based Access Control
   - Role definitions, permission checks
   - Audit logging and role management UI

8. Validation & Governance
   - Field-level validation, approval workflows, compliance checks

9. Testing & Documentation
   - Unit and integration tests for stores and admin flows
   - Architecture and admin user guides

---

## How to import these tasks into Azure DevOps (recommended)

Options:

A. Use the provided CSV `azure_devops_todos.csv` (in repo root). You can import it using an ADO extension or with a small script that uses the `az` CLI.

B. Use `az boards work-item create` in a script to programmatically create tasks in your ADO project (example below).

Prerequisites for option B:
- Azure CLI installed
- `az extension add --name azure-devops`
- `az login` and `az devops configure --defaults organization=https://dev.azure.com/<ORG> project=<PROJECT>`

Example PowerShell script to import the CSV and create work items using `az` (run locally; do not commit secrets):

```powershell
# Usage: .\import-todos.ps1 -CsvPath .\azure_devops_todos.csv
param(
  [string]$CsvPath = "azure_devops_todos.csv"
)

# Ensure Azure DevOps extension
az extension add --name azure-devops | Out-Null

Import-Csv -Path $CsvPath | ForEach-Object {
  $title = $_.Title
  $desc = $_.Description
  $type = $_.WorkItemType -or 'Task'
  $tags = $_.Tags

  Write-Host "Creating work item: $title"
  az boards work-item create --title "$title" --type "$type" --description "$desc" --fields "System.Tags=$tags" | Write-Output
}
```

Notes:
- The `az boards work-item create` command will use the Azure DevOps defaults configured with `az devops configure`.
- If your organization requires additional fields (Area Path, Iteration Path, Assigned To), add those columns to the CSV and set them with `--fields "System.AreaPath=..."` etc.

---

## CSV format provided

A CSV file `azure_devops_todos.csv` has been added to the repo root with columns:
- Title
- Description
- WorkItemType
- Tags

This CSV is intentionally simple so you can edit it before importing if you want to add Areas / Iterations / Assignees.

---

## Next steps I can take for you

- Generate a PowerShell script that uses ADO REST API with a PAT (template only). You keep the PAT and run locally.
- Add Area/Iteration/Assignee columns to the CSV tailored to your board.
- Directly create work items in your ADO instance if you provide safe CI runner credentials (not recommended here).

Additional repository artifacts added in this update:

- `src/lib/config/appConfigStore.ts` — global app config store (localStorage-backed).
- `src/lib/config/projectConfigStore.ts` — project config wrapper with migration from legacy registry.
- `src/components/AppAdmin.tsx` — minimal App (AI CoE) admin UI skeleton.
- `scripts/setup-demo.ps1` — helper to install deps and show next steps.
- `scripts/run-demo.ps1` — starts mock APIM and Vite dev server in new PowerShell windows.
- `scripts/push-release.ps1` — local helper to create a git tag and push (requires local git credentials).

Release/version notes:
- `package.json` version bumped to `0.75`.

How to run the demo after cloning:

1. Open PowerShell, run `scripts\setup-demo.ps1` to install dependencies.
2. Start the services:
   - `npm run mock-apim` (or use `scripts\run-demo.ps1` to start both mock-apim and dev server in new windows)
   - `npm run dev`

To publish the release tag, run locally:

```powershell
.\scripts\push-release.ps1 -Version 0.75
```

Note: I cannot push to your remote from here. The `push-release.ps1` script performs the tagging and push from your machine using your credentials.

Tell me which of the above you'd like and I will either generate the script or run the local-import helper for you to run.
