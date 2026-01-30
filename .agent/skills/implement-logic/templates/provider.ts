/**
 * Generic Provider Pattern Template
 *
 * Rules:
 * 1. Define an Interface (IProvider).
 * 2. Implement Concrete Classes.
 * 3. Export a Factory/Singleton getter.
 */

// 1. Interface
export interface I__ProviderName__ {
  execute(data: unknown): Promise<void>;
}

// 2. Concrete Implementations
export class Default__ProviderName__ implements I__ProviderName__ {
  async execute(data: unknown): Promise<void> {
    console.log('Default implementation');
  }
}

export class Mock__ProviderName__ implements I__ProviderName__ {
  async execute(data: unknown): Promise<void> {
    console.log('Mock implementation for tests');
  }
}

// 3. Factory / Singleton
let instance: I__ProviderName__;

export function get__ProviderName__(): I__ProviderName__ {
  if (!instance) {
    // Use environment variables or logic to select implementation
    if (process.env.NODE_ENV === 'test') {
      instance = new Mock__ProviderName__();
    } else {
      instance = new Default__ProviderName__();
    }
  }
  return instance;
}
