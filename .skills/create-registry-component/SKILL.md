# Skill: Create Registry Component

This skill provides the authoritative workflow for creating components that plug into the Shell's Registry zones.

## 1. Directory Structure

Registry components MUST be organized into subdirectories named after the shell zone they target.

- **Core Overrides**: `core/src/registry/{zone}/`
- **Modules**: `modules/{name}/src/registry/{zone}/`

**Standard Zones**: `header-end`, `nav-main`, `dashboard-widgets`, `profile-settings`.

## 2. Naming Convention

Files MUST follow the pattern `{order}-{kebab-name}.tsx`.

- **Order**: A numeric prefix (e.g., `10-`, `20-`) that defines the render order within the zone. Lower numbers render first.
- **Kebab Name**: A descriptive name for the component.

Example: `30-theme-selector.tsx`

## 3. Implementation Standards

### Client Hydration

Interactive registry components MUST include the `'use client';` directive at the very top of the file to ensure proper hydration in the Astro/Shell environment.

### Default Export

Registry components MUST be implemented as React functional components and exported as the `default` export.

### Internal Imports (No Whitespace)

Internal imports MUST use absolute aliases (`@/`, `@modules/`). Do **NOT** insert a space before the `@` symbol.

### Shell-Agnostic Layout Wrapping

Registry components SHOULD wrap content in a layout container (e.g., `flex items-center`) that respects the shell's viewport and zone constraints.

### Conditional Rendering

Registry components MAY return `null` to opt-out of rendering (e.g., if a user lacks permissions or data is missing). The Shell handles these empty states gracefully.

## 4. Manifest Registration

After creating the component, you MUST register it in the module's `ui.yaml` file.

```yaml
registry:
  { zone }:
    - name: { kebab-name }
      component: src/registry/{zone}/{order}-{kebab-name}.tsx
      order: { order }
```

## 5. Template

Refer to `templates/registry-component.tsx.template` for a boilerplate implementation.
