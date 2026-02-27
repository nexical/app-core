---
title: How to Create a Widget
description: Step-by-step guide to adding a component to the registry.
sidebar:
  order: 1
---

Registry components are the "LEGO blocks" of the Nexical interface. They allow modules to inject UI elements into the Shell without modifying core code.

## 1. Identify the Zone

First, determine where your widget should appear. Common zones include:

- `nav-main`: The primary sidebar navigation.
- `header-end`: The right side of the global header.
- `dashboard-widgets`: The main dashboard area.

## 2. Create the Component

Create a new file in your module's registry directory: `modules/{module}/src/registry/{zone}/{order}-{name}.tsx`.

**Example:** `modules/crm/src/registry/nav-main/20-leads-link.tsx`

```tsx
import React from 'react';

export default function LeadsLink() {
  return (
    <a href="/leads" className="flex items-center gap-2 p-2 rounded hover:bg-muted">
      <span>📥</span>
      <span>Leads</span>
    </a>
  );
}
```

The numeric prefix (`20-`) determines the render order.

## 3. Use Shared State (Optional)

If your widget needs data (like the current user), use the `useNavData` hook.

```tsx
import { useNavData } from '@/lib/ui/nav-context';

export default function UserGreeting() {
  const { context } = useNavData();

  if (!context?.user) return null;

  return <div>Hello, {context.user.name}</div>;
}
```
