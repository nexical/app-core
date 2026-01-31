import type { AstroGlobal, APIContext } from 'astro';

export interface RolePolicy {
  check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void>;
  redirect?(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<Response | undefined | void | string>;
}

export type RoleIdentifier = string;

class RoleRegistry {
  private policies: Map<string, RolePolicy> = new Map();

  public register(name: string, policy: RolePolicy) {
    if (this.policies.has(name)) {
      console.warn(`[RoleRegistry] Overwriting role policy '${name}'`);
    }
    this.policies.set(name, policy);
  }

  public get(name: string): RolePolicy | undefined {
    return this.policies.get(name);
  }

  public has(name: string): boolean {
    return this.policies.has(name);
  }
  public async check(
    name: string,
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    const policy = this.get(name);
    if (!policy) {
      // If strictly ensuring security, a missing policy should probably fail.
      // Or we could log warning and deny.
      // For now, let's throw to match the caller's catch block expectation which treats errors as failures.
      throw new Error(`[RoleRegistry] Role policy '${name}' not found`);
    }
    await policy.check(context, input, data);
  }
}

export const roleRegistry = new RoleRegistry();
