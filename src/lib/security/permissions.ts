class PermissionRegistry {
  private registry: Map<string, Set<string>> = new Map();

  /**
   * Registers allowed actions for a specific role.
   * @param role The role name (e.g., 'ADMIN')
   * @param actions List of allowed action strings
   */
  public register(role: string, actions: readonly string[]) {
    const existing = this.registry.get(role) || new Set();
    actions.forEach((a) => existing.add(a));
    this.registry.set(role, existing);
  }

  /**
   * Checks if a role is authorized to perform an action using the global registry.
   * @param action The action attempting to be performed
   * @param role The role of the actor
   * @returns true if authorized, false otherwise
   */
  public check(action: string, role: string): boolean {
    const allowed = this.registry.get(role);
    if (!allowed) return false;
    return allowed.has(action);
  }
}

export const Permissions = new PermissionRegistry();
