import {
  Node,
  Decorator,
  DecoratableNode,
  type OptionalKind,
  type DecoratorStructure,
} from 'ts-morph';
import { BasePrimitive } from '../core/base-primitive';
import { type ValidationResult } from '../contracts';
import { type DecoratorConfig } from '../../types';

// DecoratableNode is a union of all nodes that can have decorators.

export class DecoratorPrimitive extends BasePrimitive<Decorator, DecoratorConfig> {
  find(parent: Node): Decorator | undefined {
    if (!Node.isDecoratable(parent)) return undefined;
    // Cast or assume parent has getDecorator.
    return (parent as any).getDecorator((d: Decorator) => d.getName() === this.config.name);
  }

  create(parent: Node): Decorator {
    // addDecorator is specific, assume parent is correct type if this primitive is called.
    // Or check Node.isDecoratable(parent)
    // Note: ts-morph addDecorator uses structure.
    return (parent as any).addDecorator(this.toStructure());
  }

  update(node: Decorator) {
    const structure = this.toStructure();

    // Check arguments drift
    // Decorator arguments can be strings.
    // We compare the text of arguments.
    const currentArgs = node.getArguments().map((a) => a.getText());
    const targetArgs = (structure.arguments as string[]) || [];

    const isArgsDrift =
      currentArgs.length !== targetArgs.length ||
      currentArgs.some((arg, i) => arg !== targetArgs[i]);

    if (isArgsDrift) {
      // Simplest way is to remove argument and add new ones or mostly setArguments (if available)
      // ts-morph node.removeArgument is complex.
      // node.setArguments exists? No.
      // But we can removing the decorator and re-adding, OR iterate args.
      // Re-adding is safer for arguments specifically as they are complex expressions.
      // However, that loses the specific node identity if we were caching it.
      // But since we are inside 'update', we should try to be granular if possible.
      // Actually, remove and re-add IS what the old helper did.

      // But avoiding full removal preserves position?
      // Not really for decorators (list order matter).

      // Let's use the standard "replace" pattern for complex internals
      node.replaceWithText(this.generateText());
    }
  }

  validate(node: Decorator): ValidationResult {
    const issues: string[] = [];

    // Name check is implicit by find()

    // Args check
    const currentArgs = node.getArguments().map((a) => a.getText());
    const targetArgs = this.config.arguments || [];

    if (currentArgs.length !== targetArgs.length) {
      issues.push(
        `Decorator '@${this.config.name}' argument count mismatch. Expected: ${targetArgs.length}, Found: ${currentArgs.length}`,
      );
    } else {
      // Check content
      currentArgs.forEach((arg, i) => {
        if (arg !== targetArgs[i]) {
          issues.push(
            `Decorator '@${this.config.name}' argument ${i} mismatch. Expected: ${targetArgs[i]}, Found: ${arg}`,
          );
        }
      });
    }

    return { valid: issues.length === 0, issues };
  }

  private toStructure(): OptionalKind<DecoratorStructure> {
    return {
      name: this.config.name,
      arguments: this.config.arguments,
    };
  }

  private generateText(): string {
    const args = this.config.arguments?.join(', ') || '';
    return `@${this.config.name}(${args})`;
  }
}
