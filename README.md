# Nexus Base

**Nexus Base** is a modern, modular, single-user application shell built for scalability and maintainability. It serves as the foundational "Operating System" for downstream applications (like TeamSeed and ArcNexus), providing a robust core with authentication, a dynamic registry-based UI shell, and a clean separation of concerns.

## 🚀 Key Features

*   **Registry/Shell Architecture**: A dynamic "Operating System" UI pattern where features are loaded into zones (`nav-main`, `header-end`, `details-panel`) via a Registry, keeping the core shell immutable.
*   **Authentication**: Secure, full-featured auth system using **Auth.js (v5)** with Prism Adapter. Includes registration, login, email verification, password reset, and role-based access control.
*   **Tech Stack**:
    *   **Framework**: [Astro](https://astro.build) (Server-side rendering, API routes).
    *   **UI Library**: [React](https://react.dev) with [Tailwind CSS](https://tailwindcss.com).
    *   **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io).
    *   **State Management**: Zustand (for Shell state).
    *   **Testing**: Playwright (E2E).
*   **Production-Ready**: Dockerized development and production environments.

## 🛠️ Prerequisites

Ensure you have the following installed:

*   **Node.js** (v20+ recommended)
*   **Docker** & **Docker Compose**
*   **npm**

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd app-core
npm install
```

### 2. Environment Setup
Copy the example environment file and configure it:
```bash
cp .env.example .env
```
Update `.env` with your secure secrets (Generate secrets with `openssl rand -hex 32`).

### 3. Start Development
To start the development server and the database automatically:
```bash
npm run dev
```
*   **URL**: http://localhost:4321
*   **Database**: PostgreSQL running on port `5432` (managed via `compose.db.yml`).

## 📦 Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Postgres (Docker) + Astro Dev Server. |
| `npm run build` | Builds the project for production. |
| `npm run preview` | Previews the production build locally. |
| `npm run db:up` | Starts only the PostgreSQL database container. |
| `npm run db:down` | Stops the PostgreSQL database container. |
| `npm run docker:up` | Starts the entire app (App + DB) in Docker mode. |
| `npm run test:e2e` | Runs End-to-End tests using Playwright in Docker. |
| `npm run test:e2e:ui` | Runs Playwright UI for interactive testing. |

## 🧪 Testing

Nexus Base uses **Playwright** for rigorous End-to-End (E2E) testing.

To run tests in a headless CI-like environment (Dockerized):
```bash
npm run test:e2e
```

To run tests interactively with the Playwright UI:
```bash
npm run test:e2e:ui
```

## 🏗️ Architecture

### Directory Structure
```text
/
├── compose.db.yaml    # Postgres Service Definition
├── compose.yml        # Development Docker Compose (Extends db)
├── compose.test.yml   # Testing Docker Compose (Extends db)
├── Dockerfile         # Production Dockerfile
├── src/
│   ├── actions/       # Server Actions (Backend Logic)
│   │   └── core/      # Core User/Auth Actions
│   ├── components/    # Reusable UI Components
│   │   └── shell/     # Master Shell & Layouts
│   ├── lib/           # Utilities (DB, Email, Registry Loader)
│   ├── registry/      # UI Zones (The "Registry")
│   │   ├── nav-main/
│   │   ├── header-end/
│   │   └── ...
│   ├── layouts/       # Astro Layouts
│   └── pages/         # Astro Routes
```

### The Shell Pattern
Everything is a "plugin". The `MasterShell` loads components dynamically from `src/registry/` into specific zones.
To add a sidebar link, simply create a component in `src/registry/nav-main/` with an exported `order` constant.

## 📝 License
Proprietary / Closed Source (Update as needed)
