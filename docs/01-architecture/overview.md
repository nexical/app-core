---
title: Architectural Overview
description: The high-level design of the Nexical Ecosystem.
sidebar:
  order: 1
---

## The "Shell & Registry" Architecture

The Nexical Ecosystem enforces a strict separation between the **Container** (Shell) and the **Content** (Registry).

### The Shell (Immutable Kernel)

- **Location:** `src/components/shell/`
- **Role:** The "SaaS Operating System." It handles viewport responsiveness, layout physics, and "Zones" (empty slots).
- **Rule:** **DO NOT EDIT** the shell to add business features. Only edit it to fix layout bugs or add new "Zones."

### The Registry (User Space)

- **Location:** `modules/{name}/src/registry/`
- **Role:** The "App Store." Every feature (Dashboard, User Profile) is a standalone file that "injects" itself into a specific zone.
- **Naming Convention:** `{order}-{kebab-name}.tsx` (e.g., `10-dashboard.tsx`).

### Core Neutrality Protocol

The platform adheres to a strict "Agnostic Core" policy:

- **Generic Discovery**: The Core handles integration (routing, theming, dependency resolution) via discovery of module-relative paths rather than hardcoded lists.
- **Module Loaders**: All cross-module registration must occur through the `HookSystem` or dedicated `Registries`.
- **No Module Awareness**: The core platform must never know what modules are installed.

---

## Backend Architecture: Modular API

We utilize a 3-tier modular monolith architecture to ensure maintainability.

### 1. The Controller (Actions)

- **Location:** `modules/{name}/src/actions/`
- **Role:** Orchestration layer for complex business logic.
- **Rules:**
  - MUST define Zod schema for validation.
  - MUST delegat all database operations to Services.

### 2. The Service (Business Logic)

- **Location:** `modules/{name}/src/services/`
- **Role:** The "System of Record" authority and exclusive DB gateway.
- **Rules:**
  - Handles database transactions.
  - Exclusive authority for specific model logic.

### 3. The Data Layer (Prisma/DB)

- **Location:** `src/lib/core/db.ts`
- **Role:** System of record for all DB operations.
