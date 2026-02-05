// GENERATED CODE - DO NOT MODIFY
import type { AstroGlobal, APIContext } from 'astro';

export abstract class BaseRole {
  public static async check(
    context: AstroGlobal | APIContext,
    permission: string,
  ): Promise<boolean> {
    return true;
  }
}
