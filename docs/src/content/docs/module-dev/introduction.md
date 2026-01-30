---
title: Introduction to Modules
description: Understanding the ArcNexus Modular Extension System.
sidebar:
  order: 1
---

Welcome to the ArcNexus Plug-in System. This system allows you to build powerful, self-contained modules that extend every layer of the platform.

## The Modular Monolith

ArcNexus uses Astro's build-time capabilities to create a **Modular Monolith**. You develop features in completely isolated "Modules" (folders), but they are compiled into a single, high-performance application.

## Key Concepts

### 1. UI Modularization (The Registry)

Instead of editing a central `Sidebar.tsx`, modules "pin" components to zones.

- **Define**: Place a file in `modules/{name}/src/registry/`.
- **Use**: The `RegistryLoader` scans and renders these files.

### 2. Backend Logic (Modular API)

- **Modular API**: REST endpoints defined in `api.yaml`.
- **Federated SDK**: Type-safe SDK generated in `src/sdk/`.
- **Aggregator**: Global `api` client binds all module SDKs.

### 3. Data Layer (Schema Ontology)

- **Additive Schema**: Define data models in `models.yaml`.
- **Compiler**: Merges all fragments into a unified `schema.prisma`.

### 4. Routing (Astro Integration)

- Modules have their own `src/pages/` directory.
- Astro injects these routes into the main application.

### 5. State Management

- **Relaxed Contexts**: `NavContext` allows modules to inject data via Middleware.
- **Consumption**: Components use `useNavData()` to access this injected state.
