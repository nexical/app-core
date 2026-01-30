import { type ModelDef, type FileDefinition, type ImportConfig } from '../types.js';
import { BaseBuilder } from './base-builder.js';

export class ActorTypeBuilder extends BaseBuilder {
  constructor(private models: ModelDef[]) {
    super();
  }

  protected getSchema(node?: any): FileDefinition {
    // ... existing logic ...
    const actorModels = this.models.filter((m) => m.actor);

    const imports: ImportConfig[] = [];
    const statements: string[] = [];

    for (const model of actorModels) {
      // Import the model type
      imports.push({
        moduleSpecifier: './sdk/types',
        isTypeOnly: true,
        namedImports: [model.name],
      });
    }

    if (actorModels.length > 0) {
      statements.push(`declare global {
  namespace App {
    interface ActorMap {
            ${actorModels.map((m: ModelDef) => `${m.name.charAt(0).toLowerCase() + m.name.slice(1)}: ${m.name} & { type: '${m.name.charAt(0).toLowerCase() + m.name.slice(1)}' };`).join('\n            ')}
  }
}
}`);
    }

    return {
      imports: imports,
      statements: statements,
    };
  }

  public override ensure(node: any): void {
    // Fully generated file, clear previous content to avoid duplication
    if ('removeText' in node) node.removeText();
    super.ensure(node);
  }
}
