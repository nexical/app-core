---
name: validate-schema
description: Ensures that changes to models.yaml are valid Prisma syntax, DTO compliant, and don't break architectural contracts.
---

# validate-schema Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Separation of concerns and "Shell-Registry" pattern.
- `CODE.md`: Strict typing and naming conventions.
- `MODULES.md`: Modular API and Model extension rules.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

This skill acts as the **Gatekeeper**. Its purpose is to ensure that any schema change is valid for both the Database (Prisma) and the API (SDK/DTOs).

## 1. Primary Action

Run the full validation pipeline (Prisma, SDK, and Type Integrity).

```bash
npx tsx scripts/generate-prisma.ts && npx tsx scripts/generate-sdk.ts && npm run db:validate && npx tsc --noEmit
```

### What it checks

1.  **YAML & Merge Integrity**: Validates `models.yaml` syntax and ensures module schemas merge cleanly with the Core schema.
2.  **DTO Compliance**: Ensures non-DB models (`db: false`) follow naming conventions (e.g., `*DTO`) and set `api: false` as per project standards.
3.  **Role Verification**: Cross-references `role:` attributes in `models.yaml` (either string or granular object) with the existence of corresponding policies in `src/roles/`.
4.  **Prisma & SDK Integrity**: Validates Prisma syntax (using `isList: true` for arrays) and ensures the generated SDK is type-safe.
5.  **Extension Correctness**: Ensures model extensions use the `extended: true` flag.
6.  **Reserved Suffixes**: Forbids naming models with suffixes `Service`, `Action`, `Store`, or `Provider` to avoid collisions with generated classes.

## 2. When to use

- **Immediately after** `design-data` or manual updates to a `models.yaml` file.
- **Before** running `scaffold-module` or `implement-logic`.
- Whenever "Type not found" or "Prisma generation failed" errors occur.

## 3. Resolving Errors

### Prisma/Merge Errors

- **List Syntax**: Use `isList: true` instead of `[]` notation in `models.yaml`.
- **Redefinition**: Ensure you are not redefining a core field type. Use the `extended: true` flag for extensions.
- **Relations**: Ensure ` @relation` fields are correctly mapped in both directions.

### DTO/SDK Errors

- **Collision**: If a model is named `UserService`, it will collide with the generated `UserService` class. Rename the model.
- **API Flag**: DTOs should typically have `api: false` in `models.yaml` as they are consumed via custom actions or specialized handlers.

### Role Errors

- If a model has `role: workspace-admin` or a granular role like `create: admin`, verify that the corresponding policy files (e.g., `src/roles/admin.ts`) exist.

## 4. Merge & Extension Strategy

- **New Models**: Always use PascalCase.
- **Extensions**: To add fields to a Core model, set `extended: true` and define the model name identically to Core. The generator will perform a deep-merge. **NEVER** remove or change types of existing core fields.
