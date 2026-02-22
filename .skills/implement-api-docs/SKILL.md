---
name: implement-api-docs
description: 'This skill governs the implementation of interactive API documentation components (typically using the Scalar library) within the Nexus Ecosystem.'
---

# Skill: Implement API Documentation (Scalar)

This skill governs the implementation of interactive API documentation components (typically using the Scalar library) within the Nexus Ecosystem.

## Lifecycle

1.  **Research**: Identify the API specification source (OpenAPI YAML/JSON) and the target Shell Zone for the documentation viewer.
2.  **Strategy**: Plan the `ScalarDocs` component implementation, ensuring it respects the Shell's layout and the system's reactive theme.
3.  **Execution**:
    - **Named Export**: Export the component as a named PascalCase constant from `core/src/components/ScalarDocs.tsx`.
    - **Type-Safe Specs**: Define the `spec` prop as `Record<string, unknown>`.
    - **Reactive Theme**: Implement a `MutationObserver` within `useEffect` to sync the Scalar `theme` with the global `.dark` class on `document.documentElement`.
    - **SSR Safety**: Guard all browser-only globals (`document`, `MutationObserver`) inside `useEffect`.
    - **Layout**: Apply `h-full w-full` to the root container to respect Shell constraints.

## Patterns & Standards

### Type-Safe Generic Records

Never use `any` for API specifications. Use `Record<string, unknown>` to maintain strict type safety while allowing dynamic object structures.

### Reactive Theme Synchronization

Third-party libraries like Scalar often require manual theme updates. Use the following "Gold Standard" pattern:

```tsx
useEffect(() => {
  const checkTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  };

  // Initial check
  checkTheme();

  // Observe global theme changes
  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
}, []);
```

### Full-Viewport Layout

Documentation components hosted within Shell Zones MUST occupy the full available space using Tailwind utility classes:

```tsx
return <div className="h-full w-full overflow-hidden">{/* Scalar component */}</div>;
```
