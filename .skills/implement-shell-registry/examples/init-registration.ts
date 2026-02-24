/**
 * Example: Registry Initialization
 *
 * Registries must be imported in the application boot sequence to ensure
 * they are instantiated and ready before any selection logic runs.
 */

// core/src/init.ts

// Force instantiation of the registry by importing it for side-effects.
// This ensures that the singleton is created and ready to accept registrations
// from other modules.
import '@/lib/registries/shell-registry';

export async function init() {
  // ... other initialization logic
  console.info('Core registries initialized');
}
