# EVA DA 2.0 Demo

**Enterprise Virtual Assistant - Domain Assistant** (EVA DA) is a project-aware, bilingual, accessible AI assistant demo for Government of Canada use cases.

## Version 0.75

This release includes:
- Project registry with full CRUD capabilities
- App-level configuration (AI CoE Admin)
- Project-level configuration (Project Admin)
- Mock APIM for local development
- Bilingual support (EN/FR)
- Theme customization per project
- Demo scripts for easy setup

## Quick Start

### Prerequisites
- Node.js v18+ (v24.11.0 recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MarcoPolo483/eva-da-2.git
cd eva-da-2
```

2. Run the setup script (Windows PowerShell):
```powershell
.\scripts\setup-demo.ps1
```

Or install dependencies manually:
```bash
npm ci
```

### Running the Demo

**Option 1: Automated (Windows)**
```powershell
.\scripts\run-demo.ps1
```
This starts both the mock APIM and dev server in separate windows.

**Option 2: Manual (two terminals)**

Terminal 1 - Start mock APIM:
```bash
npm run mock-apim
```

Terminal 2 - Start dev server:
```bash
npm run dev
```

Then open your browser to the URL shown (typically http://localhost:5173)

## Project Structure

```
eva-da-2/
├── src/
│   ├── components/        # React components
│   │   ├── AppAdmin.tsx          # AI CoE admin UI
│   │   ├── ProjectRegistry.tsx   # Project CRUD UI
│   │   ├── ChatPanel.tsx         # Main chat interface
│   │   └── ...
│   ├── lib/
│   │   ├── config/               # Configuration stores
│   │   │   ├── appConfigStore.ts     # Global app config
│   │   │   └── projectConfigStore.ts # Project config
│   │   ├── apimClient.ts         # APIM integration
│   │   └── ...
│   ├── i18n/             # Translations (EN/FR)
│   └── assets/           # Images, logos
├── scripts/              # Setup and demo scripts
├── docs/                 # Documentation
│   └── ADMIN_TODO.md     # Roadmap and Azure DevOps import
└── public/               # Static assets
```

## Features

### Project Management
- **Project Registry**: Create, edit, delete projects with full configuration
- **Themes**: Per-project color schemes and branding
- **RAG Configuration**: Customize retrieval and indexing per project
- **APIM Settings**: Local mock or Azure APIM integration
- **Guardrails**: Configure safety and governance policies

### Admin Portals
- **Project Admin**: Manage project-specific settings
- **AI CoE Admin**: Global configuration and defaults

### Development
- **Mock APIM**: Local API simulation for development
- **localStorage**: Configuration persistence (demo mode)
- **Export/Import**: Share configurations via JSON

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run mock-apim` - Start mock APIM server
- `npm run lint` - Run ESLint

## Configuration

### App-Level (AI CoE)
Global settings stored in localStorage key: `eva.appConfig.v0.75`
- Default language
- Design system defaults
- Mock APIM configuration
- Feature flags

### Project-Level
Project configurations stored in: `eva.projectConfig.v0.75`
- Business metadata
- Theme overrides
- RAG engine settings
- Guardrails and security
- Data sources

## Documentation

- [Admin TODO & Roadmap](docs/ADMIN_TODO.md) - Future work and Azure DevOps integration
- [APIM Contract](docs/APIM_CONTRACT.md) - API specifications
- [Deployment Guide](docs/DEPLOY.md) - Production deployment steps

## Technology Stack

- **React 19** with TypeScript
- **Vite 7** for build and dev server
- **Tailwind CSS** for styling
- **i18next** for internationalization
- **Express** for mock APIM

## Contributing

This is a demo project. For production use, see the deployment guide and roadmap in `docs/`.

## License

Government of Canada internal use.

## Version History

### v0.75 (2025-11-10)
- Added app/project configuration architecture
- Implemented AppAdmin UI
- Enhanced ProjectRegistry with full CRUD
- Added demo setup scripts
- Updated type system and validation

### Previous versions
See git tags for earlier releases.
