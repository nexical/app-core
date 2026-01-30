---
title: Coding Standards
description: Strict guidelines for ensuring maintainability and scalability.
sidebar:
  order: 2
---

This document establishes the authoritative coding standards for the project.

## Core Philosophy

### AI-Native Context

- **Context is King**: Write code that explains itself. Generative AI relies on clear variable names and explicit types.
- **Explicit over Implicit**: Avoid "magic" logic.
- **Small Blast Radius**: Keep functions and components focused.

### Strictness

- **Sanity over Speed**: We prefer verbose, type-safe code.
- **Zero Warnings**: The main branch must be warning-free.

## TypeScript Standards

### Type Safety

- **No `any`**: Strictly forbidden. Use `unknown` + Zod.
- **No `ts-ignore`**: Fix the underlying issue.

### Return Types

- **Explicit Returns**: All exported functions MUST have an explicit return type.

### Uniform Service Response

All public methods in **Services** and **Actions** MUST return a `ServiceResponse<T>` object:

```ts
interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

## Files & Imports

### Import Aliases

- `@/` refers to `src/`.
- `@modules/` refers to `modules/`.
- `@tests/` refers to `tests/`.

### Forbidden

- Deep relative imports that traverse up the tree (e.g., `../../components`).

## Styling & CSS

We use a utility-first approach powered by **Tailwind CSS**.

- **No Arbitrary Values**: Use theme tokens (`w-32`), not arbitrary strings (`w-[123px]`).
- **Semantic Colors**: Use `bg-destructive`, not `bg-red-500`.

## Documentation

- **JSDoc**: All exported members must have JSDoc explaining _why_ it exists.
