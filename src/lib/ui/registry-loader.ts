import type { ComponentType } from 'react';
import { getRegistryModules } from '../core/glob-helper';

export interface RegistryComponent {
  component: ComponentType<unknown>; // ComponentType often needs any or a broad type for generic registry use
  order: number;
  name: string;
}

/**
 * Loads components from the registry for a specific zone.
 * Uses Vite's import.meta.glob for dynamic loading.
 */
export async function getZoneComponents(zone: string): Promise<RegistryComponent[]> {
  // Glob pattern to find all files in the specific zone directory
  // Pattern: /src/registry/{zone}/*.tsx AND /modules/{module}/registry/{zone}/*.tsx
  const modules = getRegistryModules();

  const components: RegistryComponent[] = [];

  for (const path in modules) {
    // Filter by zone
    if (!path.includes(`/registry/${zone}/`)) continue;

    const mod = modules[path] as Record<string, unknown>;

    // Extract order and name from filename
    // Filename format: {order}-{name}.tsx (e.g., 10-dashboard.tsx) or just {name}.tsx
    const filename = path.split('/').pop()?.replace('.tsx', '') || '';

    let order = 99;
    let name = filename;

    // Try to extract order from filename first
    const parts = filename.split('-');
    if (parts.length > 1 && !isNaN(Number(parts[0]))) {
      order = Number(parts[0]);
      name = parts.slice(1).join('-');
    } else if (typeof mod.order === 'number') {
      // Fallback: check if module exports 'order'
      order = mod.order;
    }

    // Allow explicit 'name' export to override extracted filename
    if (typeof mod.name === 'string') {
      name = mod.name;
    }

    // Check if module exports a default component
    if (mod.default) {
      components.push({
        component: mod.default as ComponentType<any>,
        order,
        name,
      });
    }
  }

  return components.sort((a, b) => a.order - b.order);
}
