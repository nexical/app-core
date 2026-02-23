---
name: implement-pwa-features
description: 'Expert guide for implementing Progressive Web App (PWA) features within the Nexus Ecosystem, including install prompts, notifications, and offline capabilities.'
---

# Skill: implement-pwa-features

Expert guide for implementing Progressive Web App (PWA) features within the Nexus Ecosystem, including install prompts, notifications, and offline capabilities.

---

## 1. Architectural Mandates

PWA features must be implemented with a strict focus on **SSR Safety**, **Type Integrity**, and **Standardized Overlay Behavior**.

### 1.1 Core Internal Components (Named Exports)

PWA components located in `core/src/components/pwa/` (that are not registry-injected) MUST use named PascalCase exports. This distinguishes them from Registry components that use default exports.

- **Mandate**: Use `export function ComponentName()`.
- **Directive**: Interactive components (using hooks) MUST include `'use client';` at the top of the file to ensure proper hydration.
- **Reasoning**: Ensures explicit importing and better IDE support for core-level utilities.

### 1.2 SSR-Safe Browser Access

Components interacting with browser-only APIs (window, sessionStorage, matchMedia) must perform safety checks to prevent errors during server-side rendering (SSR) or build-time generation in Astro.

- **Mandate**: All browser-only API calls MUST be guarded with `typeof window !== 'undefined'` checks or executed within `useEffect` hooks.
- **Example**: `if (typeof window === 'undefined') return false;`

---

## 2. Implementation Patterns

### 2.1 Local Event Interface Extension (Zero-Tolerance for any)

To maintain strict type safety while handling experimental browser events (like `beforeinstallprompt`), you MUST define local interfaces that extend the base `Event` type.

- **Rule**: Custom or experimental browser event types MUST be defined locally using interfaces extending standard DOM types; the 'any' type remains strictly forbidden.
- **Reference**: See `examples/before-install-event.ts`.

### 2.2 Overlay Animation Styling

System-level prompts and overlays use specific Tailwind animation classes combined with fixed positioning to provide a consistent "operating system" feel.

- **Rule**: Transient UI prompts MUST use the standard `animate-in` and `slide-in-from-*` classes for entry transitions.
- **Styling**: MUST use semantic color tokens (e.g., `bg-card`, `text-card-foreground`) as defined in `core/THEME.md` and `core/CODE.md`.
- **Example**: `fixed bottom-4 md:right-4 z-50 animate-in slide-in-from-bottom-4 bg-card text-card-foreground`

### 2.3 Session-Based Dismissal Logic

User preferences for dismissing transient UI (like PWA banners) are persisted in `sessionStorage` to prevent intrusive behavior within a single session without requiring a database round-trip.

- **Rule**: UI-only state preferences SHOULD be stored in `sessionStorage` and validated during component mount.
- **Example**: `sessionStorage.setItem('pwa-banner-dismissed', 'true');`

---

## 3. Testing Protocols

### 3.1 E2E Test Selectors

Interactive elements and major containers must include `data-testid` attributes to facilitate robust end-to-end testing as mandated by the project's testing protocols.

- **Rule**: Every interactive component, button, or layout container MUST include a unique `data-testid` attribute (e.g., `data-testid="install-prompt"`).

---

## 4. Templates & Examples

### [templates/install-prompt.tsx](templates/install-prompt.tsx)

A reference implementation of the `InstallPrompt` component following all architectural mandates.

### [examples/before-install-event.ts](examples/before-install-event.ts)

Demonstrates the typed interface extension for PWA-specific browser events.
