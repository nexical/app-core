import { SourceFile, ImportDeclaration } from 'ts-morph';
import { BasePrimitive } from './base-primitive.js';
import { type ImportConfig } from '../../types.js';

export class ImportPrimitive extends BasePrimitive<ImportDeclaration, ImportConfig> {
  private normalizeModuleSpecifier(specifier: string): string {
    // 1. Remove extensions
    let normalized = specifier.replace(/\.(ts|js|mjs|cjs)$/, '');

    // 2. Strip /index
    normalized = normalized.replace(/\/index$/, '');

    // 3. Apply legacy mapping
    const legacyMapping: Record<string, string> = {
      '@/lib/api-docs': '@/lib/api/api-docs',
      '@/lib/api-guard': '@/lib/api/api-guard',
      '@/lib/hooks': '@/lib/modules/hooks',
      '@/lib/api-query': '@/lib/api/api-query',
      '@/lib/utils': '@/lib/core/utils',
      '@/lib/db': '@/lib/core/db',
    };
    normalized = legacyMapping[normalized] || normalized;

    // 4. Standardize SDK subpaths to canonical SDK root if it's the same logical target
    // e.g., @modules/user-api/src/sdk/types -> @modules/user-api/src/sdk
    if (normalized.includes('/src/sdk/')) {
      normalized = normalized.split('/src/sdk/')[0] + '/src/sdk';
    }

    return normalized;
  }

  find(parent: SourceFile) {
    const normalizedTarget = this.normalizeModuleSpecifier(this.config.moduleSpecifier);

    return parent.getImportDeclaration((decl) => {
      const normalizedExisting = this.normalizeModuleSpecifier(decl.getModuleSpecifierValue());
      return normalizedExisting === normalizedTarget;
    });
  }

  create(parent: SourceFile) {
    return parent.addImportDeclaration({
      moduleSpecifier: this.normalizeModuleSpecifier(this.config.moduleSpecifier),
      defaultImport: this.config.defaultImport,
      namedImports: this.config.namedImports,
      isTypeOnly: this.config.isTypeOnly,
    });
  }

  update(node: ImportDeclaration) {
    const sourceFile = node.getSourceFile();
    const normalizedTarget = this.normalizeModuleSpecifier(this.config.moduleSpecifier);

    // 0. Deduplicate: Find OTHER imports that normalize to the same target OR provide the same symbols
    const targetSymbols = this.config.namedImports || [];

    sourceFile.getImportDeclarations().forEach((decl) => {
      if (decl === node) return;

      const normalizedExisting = this.normalizeModuleSpecifier(decl.getModuleSpecifierValue());

      // Case A: Same module (normalized)
      if (normalizedExisting === normalizedTarget) {
        // Merge named imports before removal
        const existingNamed = decl.getNamedImports();
        if (existingNamed.length > 0) {
          const currentNames = node.getNamedImports().map((ni) => ni.getText());
          const missing = existingNamed
            .map((ni) => ni.getText())
            .filter((name) => !currentNames.includes(name));

          if (missing.length > 0) {
            node.addNamedImports(missing);
          }
        }
        decl.remove();
        return;
      }

      // Case B: Different module, but overlapping symbols from "similar" paths
      // We only do this if BOTH are @modules or BOTH are relative to avoid breaking complex aliasing
      const isTargetAliased = normalizedTarget.startsWith('@');
      const isExistingAliased = normalizedExisting.startsWith('@');

      if (isTargetAliased === isExistingAliased) {
        const existingNamed = decl.getNamedImports();
        existingNamed.forEach((ni) => {
          const sym = ni.getText().replace(/^type\s+/, '');
          if (targetSymbols.includes(sym)) {
            console.info(
              `[ImportPrimitive] Removing duplicate symbol '${sym}' from ${normalizedExisting} (moving to ${normalizedTarget})`,
            );
            ni.remove();
          }
        });

        // If existing decl is now empty, remove it
        if (
          decl.getNamedImports().length === 0 &&
          !decl.getDefaultImport() &&
          !decl.getNamespaceImport()
        ) {
          decl.remove();
        }
      }
    });

    // 1. Enforce Normalized Module Specifier
    if (node.getModuleSpecifierValue() !== normalizedTarget) {
      node.setModuleSpecifier(normalizedTarget);
    }

    // 2. Enforce Type Only
    if (this.config.isTypeOnly !== undefined && node.isTypeOnly() !== this.config.isTypeOnly) {
      node.setIsTypeOnly(this.config.isTypeOnly);

      // Fallback: if it didn't change (e.g. ts-morph behavior in some versions), force it
      if (node.isTypeOnly() !== this.config.isTypeOnly) {
        const text = node.getText();
        if (this.config.isTypeOnly && !text.includes('import type')) {
          node.replaceWithText(text.replace(/^import\s+/, 'import type '));
        } else if (!this.config.isTypeOnly && text.includes('import type')) {
          node.replaceWithText(text.replace(/^import type\s+/, 'import '));
        }
      }
    }

    // 3. Add missing named imports
    if (this.config.namedImports) {
      const namedImports = node.getNamedImports();
      const normalizedExisting = namedImports.map((ni) => ni.getText().replace(/^type\s+/, ''));

      // Remove imports not in the config
      namedImports.forEach((ni) => {
        const name = ni.getText().replace(/^type\s+/, '');
        if (!this.config.namedImports?.includes(name)) {
          ni.remove();
        }
      });

      const missingImports = this.config.namedImports.filter(
        (ni) => !normalizedExisting.includes(ni),
      );

      if (missingImports.length > 0) {
        node.addNamedImports(missingImports);
      }

      // Cleanup redundant/duplicate named imports
      const seen = new Set<string>();
      node.getNamedImports().forEach((ni) => {
        const text = ni.getText();
        const normalized = text.replace(/^type\s+/, '');

        if (seen.has(normalized)) {
          ni.remove();
          return;
        }
        seen.add(normalized);
      });

      // Re-run cleanup to remove internal 'type ' prefixes if top-level is type-only
      if (node.isTypeOnly()) {
        node.getNamedImports().forEach((ni) => {
          const text = ni.getText();
          if (text.startsWith('type ')) {
            const newName = text.replace(/^type\s+/, '');
            ni.remove();
            if (!node.getNamedImports().some((n) => n.getName() === newName)) {
              node.addNamedImport(newName);
            }
          }
        });
      }
    }

    // 4. Remove if empty (no named, no default)
    if (
      !node.getDefaultImport() &&
      node.getNamedImports().length === 0 &&
      !node.getNamespaceImport()
    ) {
      node.remove();
    }
  }
  validate(node: ImportDeclaration): import('../contracts.js').ValidationResult {
    const issues: string[] = [];

    // Check module specifier
    const normalizedTarget = this.normalizeModuleSpecifier(this.config.moduleSpecifier);
    const normalizedExisting = this.normalizeModuleSpecifier(node.getModuleSpecifierValue());
    if (normalizedExisting !== normalizedTarget) {
      issues.push(
        `Import module specifier mismatch. Expected: ${normalizedTarget} (normalized), Found: ${normalizedExisting}`,
      );
    }

    // Check default import
    if (this.config.defaultImport) {
      const defaultImport = node.getDefaultImport();
      if (!defaultImport || defaultImport.getText() !== this.config.defaultImport) {
        issues.push(
          `Import '${this.config.moduleSpecifier}' default import mismatch. Expected: ${this.config.defaultImport}, Found: ${defaultImport?.getText() ?? 'none'}`,
        );
      }
    }

    // Check named imports
    if (this.config.namedImports) {
      const namedImports = node.getNamedImports();
      const existingTexts = namedImports.map((ni) => ni.getText()); // Includes "Name as Alias"
      const missingImports = this.config.namedImports.filter((ni) => !existingTexts.includes(ni));
      if (missingImports.length > 0) {
        issues.push(
          `Import '${this.config.moduleSpecifier}' missing named imports: ${missingImports.join(', ')}`,
        );
      }
    }

    // Check Type Only
    if (this.config.isTypeOnly !== undefined && node.isTypeOnly() !== this.config.isTypeOnly) {
      issues.push(
        `Import '${this.config.moduleSpecifier}' type-only mismatch. Expected: ${this.config.isTypeOnly}, Found: ${node.isTypeOnly()}`,
      );
    }

    return { valid: issues.length === 0, issues };
  }
}
