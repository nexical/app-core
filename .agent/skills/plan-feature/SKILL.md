---
name: plan-feature
description: Determines the blast radius of a change and produces a file implementation checklist, respecting the API/UI module split and strict generation rules.
---

# plan-feature Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: 3-Tier Modular Architecture (Handler -> Action -> Service).
- `MODULES.md`: Strict separation of Generated vs. Manual code.
- `CODE.md`: Code hygiene and typed requirements.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

This skill acts as the **Architectural Planner**. It produces a concrete "To-Do" list that respects the isolation of modules and the integrity of generated code.

## 1. Goal

To answer: "If I add this feature, exactly what files do I need to touch, what must be generated, and what must be implemented manually?"

## 2. The Blast Radius

You must assume a **Split Module** architecture.

### API Module (`modules/<name>-api`)

**Definition Files (Edit these first)**

1.  **Data Schema**: `models.yaml` (Database models and relations).
2.  **API Contract**: `api.yaml` (Endpoints, inputs, and security requirements).

**Generated Files [STRICTLY DO NOT TOUCH]**

1.  **Handlers**: `src/pages/api/**/*.ts` (HTTP lifecycle).
2.  **SDK Client**: `src/sdk/**/*.ts` (Type-safe client).
3.  **Module Entry**: `src/server-init.ts` (Auto-discovery of hooks/roles).
4.  **CRUD Services**: `src/services/{model}-service.ts` (Basic DB operations).

**Manual Implementation (Business Logic)**

1.  **Action Layer**: `src/actions/{kebab-case}-{group}.ts`
    - _Rule_: MUST use `public static async run(input, context: APIContext)`.
    - _Rule_: Orchestrate logic and roles. While the standard is to delegate DB access to Services, some actions interact with `db` directly for simple orchestration.
    - _Naming_: `{verb}-{group}.ts` or `{kebab-case}-{group}.ts` (e.g., `update-me-user.ts`).
2.  **Service Layer**: `src/services/{kebab-case}-service.ts` or `*-ops-service.ts`
    - _Rule_: Domain authority for specific logic.
    - _Rule_: All public domain methods MUST be `public static` and should return `Promise<ServiceResponse<T>>`. Internal utility methods may return raw types.
    - _Naming_: Use `{kebab-case}-service.ts`. If a generated CRUD service with the same name exists, use `*-ops-service.ts`.
3.  **Role Policies**: `src/roles/{role-name}.ts`
    - _Rule_: Centralized RBAC logic. Auto-registered by `server-init.ts`.
4.  **Hooks**: `src/hooks/{kebab-case}-hooks.ts`
    - _Rule_: Side effects and data filters. Auto-registered by `server-init.ts`.

### UI Module (`modules/<name>-ui`)

1.  **Registry**: `src/registry/{zone}/{order}-{kebab-name}.tsx` (Shell injection).
2.  **Pages**: `src/pages/{route}.astro` (Virtualized routes).
3.  **Components**: `src/components/` (React/Astro UI primitives).

## 3. Output Format

Produce a checklist that clearly distinguishes between Definitions, Implementation, and the Generation step.

```markdown
### 1. Definitions (YAML)

- [MOD] `modules/referrals-api/models.yaml` (Add Referral model)
- [NEW] `modules/referrals-api/api.yaml` (Define `POST /referrals/claim`)

### 2. Generate Code

- [EXEC] Run `nexical` to generate Handlers, SDK, and CRUD Services.

### 3. Implementation (Manual)

- [NEW] `modules/referrals-api/src/services/referral-service.ts` (Domain logic)
- [NEW] `modules/referrals-api/src/actions/claim-referral-action.ts` (Orchestration)
- [NEW] `modules/referrals-api/src/roles/referral-participant.ts` (Policy)
- [NEW] `modules/referrals-api/src/hooks/referral-hooks.ts` (Side effects)
- [NEW] `modules/referrals-ui/src/registry/dashboard/10-referral-banner.tsx` (UI)

### 4. Verification

- [NEW] `modules/referrals-api/tests/integration/referral.test.ts`
```

## 4. Strategy

- **ServiceResponse**: Ensure all planned public Service methods return the standard response wrapper.
- **Action Orchestration**: Actions should aim to delegate complex logic to Services.
- **Auto-Registration**: Do not plan to edit `server-init.ts`. Files in `src/hooks/` and `src/roles/` are automatically discovered.
