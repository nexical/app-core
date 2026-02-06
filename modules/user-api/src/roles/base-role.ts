// GENERATED CODE - DO NOT MODIFY

export abstract class BaseRole {
  abstract readonly name: string;

  public static async check(context: any, permission: string): Promise<boolean> {
    return true;
  }

  public async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = (context as any).locals;
    const actor = locals?.actor || locals?.user;

    if (!actor) {
      throw new Error('Unauthorized: No actor found');
    }

    // Case insensitive comparison for robustness
    if (String(actor.role).toUpperCase() !== this.name.toUpperCase()) {
      throw new Error(`Forbidden: required role ${this.name}`);
    }
  }
}
