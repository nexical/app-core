/**
 * Vite Glob Helpers (Server-Only)
 */
export class GlobHelperServer {
  static getApiModules() {
    return import.meta.glob(
      [
        '../../pages/api/**/*.{ts,js}',
        '../../../../apps/backend/modules/*/src/pages/api/**/*.{ts,js}',
        '../../../../apps/frontend/modules/*/src/pages/api/**/*.{ts,js}',
      ],
      { eager: true },
    );
  }
}
