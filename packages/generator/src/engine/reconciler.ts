import { SourceFile, StatementedNode, ModuleDeclaration } from 'ts-morph';
import { GeneratorError } from './errors';
import { type FileDefinition } from './types';
import { ImportPrimitive } from './primitives/core/import-manager';
import { ExportPrimitive } from './primitives/core/export-manager';
import { ClassPrimitive } from './primitives/nodes/class';
import { MethodPrimitive } from './primitives/nodes/method';
import { InterfacePrimitive } from './primitives/nodes/interface';
import { EnumPrimitive } from './primitives/nodes/enum';
import { FunctionPrimitive } from './primitives/nodes/function';
import { TypePrimitive } from './primitives/nodes/type';
import { VariablePrimitive } from './primitives/nodes/variable';
import { PropertyPrimitive } from './primitives/nodes/property';
import { ConstructorPrimitive } from './primitives/nodes/constructor';
import { AccessorPrimitive } from './primitives/nodes/accessor';
import { ModulePrimitive } from './primitives/nodes/module';
import { Normalizer } from '../utils/normalizer';

// Helper type to handle both SourceFile and ModuleDeclaration (Namespace)
type NodeContainer = SourceFile | ModuleDeclaration;

export class Reconciler {
  static reconcile(sourceFile: NodeContainer, definition: FileDefinition): void {
    const filePath =
      'getFilePath' in sourceFile ? (sourceFile as SourceFile).getFilePath() : 'namespace';
    console.log(`[Reconciler] Reconciling ${filePath}`);
    try {
      // 0. Handle Header
      if (definition.header && 'insertStatements' in sourceFile) {
        const headerTrimmed = definition.header.trim();
        const sourceText = (sourceFile as SourceFile).getFullText();

        // Only insert if the file doesn't already start with the header
        if (!sourceText.trimStart().startsWith(headerTrimmed)) {
          const header = definition.header.endsWith('\n')
            ? definition.header
            : `${definition.header}\n`;
          (sourceFile as StatementedNode).insertStatements(0, header);
        }
      }

      // 1. Handle Imports (Only strictly valid on SourceFile, but let's check or just allow primitive to handle it)
      // ImportPrimitive might fail if parent is not SourceFile.
      // Typically imports are top-level only in basic usage, but namespaces can have imports? No, usually not ES imports.
      // Let's check instance.
      if ('getImportDeclarations' in sourceFile) {
        definition.imports?.forEach((config) =>
          new ImportPrimitive(config).ensure(sourceFile as SourceFile),
        );
      }

      // 2. Handle Classes
      definition.classes?.forEach((classDef) => {
        // Extract class-only config
        const { methods, properties, constructorDef, accessors, ...classConfig } = classDef;

        const classPrimitive = new ClassPrimitive(classConfig);
        const classNode = classPrimitive.ensure(sourceFile);

        // Handle Properties
        properties?.forEach((propDef) => new PropertyPrimitive(propDef).ensure(classNode));

        // Handle Constructor
        if (constructorDef) {
          new ConstructorPrimitive(constructorDef).ensure(classNode);
        }

        // Handle Accessors
        accessors?.forEach((accDef) => new AccessorPrimitive(accDef).ensure(classNode));

        // Recursive: Handle Methods
        methods?.forEach((methodDef) => new MethodPrimitive(methodDef).ensure(classNode));
      });

      // 3. Handle Interfaces
      definition.interfaces?.forEach((interfaceDef) =>
        new InterfacePrimitive(interfaceDef).ensure(sourceFile),
      );

      // 4. Handle Enums
      definition.enums?.forEach((enumDef) => new EnumPrimitive(enumDef).ensure(sourceFile));

      // 5. Handle Functions
      definition.functions?.forEach((funcDef) => new FunctionPrimitive(funcDef).ensure(sourceFile));

      // 6. Handle Types
      definition.types?.forEach((typeDef) => new TypePrimitive(typeDef).ensure(sourceFile));

      // 7. Handle Variables
      definition.variables?.forEach((varDef) => new VariablePrimitive(varDef).ensure(sourceFile));

      // 8. Handle Modules (Namespaces)
      definition.modules?.forEach((modDef) => new ModulePrimitive(modDef).ensure(sourceFile));

      // 8.5 Handle Exports (Processed after major nodes to match conventional end-of-file exports)
      if ('getExportDeclarations' in sourceFile) {
        definition.exports?.forEach((config) =>
          new ExportPrimitive(config).ensure(sourceFile as SourceFile),
        );
      }

      // 9. Handle Raw Statements (Explicitly added for flexibility)
      if ('statements' in definition && Array.isArray((definition as any).statements)) {
        const stmts = (definition as any).statements as string[];
        if ('addStatements' in sourceFile) {
          const existingText = Normalizer.normalize((sourceFile as any).getFullText());
          // Filter out statements that already exist perfectly in the file
          const uniqueStmts = stmts.filter(
            (stmt) => !existingText.includes(Normalizer.normalize(stmt)),
          );

          if (uniqueStmts.length > 0) {
            (sourceFile as StatementedNode).addStatements(uniqueStmts);
          }
        }
      }
    } catch (error) {
      const filePath =
        'getFilePath' in sourceFile ? (sourceFile as SourceFile).getFilePath() : 'namespace';
      throw new GeneratorError(
        `Failed to reconcile file: ${filePath} | ${error instanceof Error ? error.message : String(error)}`,
        { filePath },
        error,
      );
    }
  }

  static validate(
    sourceFile: NodeContainer,
    definition: FileDefinition,
  ): import('./primitives/contracts.js').ValidationResult {
    const issues: string[] = [];
    const collect = (result: import('./primitives/contracts.js').ValidationResult) => {
      if (!result.valid) issues.push(...result.issues);
    };

    // 1. Imports
    if ('getImportDeclarations' in sourceFile) {
      definition.imports?.forEach((config) => {
        const primitive = new ImportPrimitive(config);
        const node = primitive.find(sourceFile as SourceFile);
        if (!node) {
          issues.push(`Import '${config.moduleSpecifier}' is missing.`);
        } else {
          collect(primitive.validate(node));
        }
      });
    }

    // 1.5 Validate Exports
    if ('getExportDeclarations' in sourceFile) {
      definition.exports?.forEach((config) => {
        const primitive = new ExportPrimitive(config);
        const node = primitive.find(sourceFile as SourceFile);
        if (!node) {
          issues.push(`Export '${config.moduleSpecifier}' is missing.`);
        } else {
          collect(primitive.validate(node));
        }
      });
    }

    // 2. Validate Classes
    definition.classes?.forEach((classDef) => {
      const { methods, properties, constructorDef, accessors, ...classConfig } = classDef;
      const classPrimitive = new ClassPrimitive(classConfig);

      const classNode = classPrimitive.find(sourceFile);
      if (!classNode) {
        issues.push(`Class '${classConfig.name}' is missing.`);
        return;
      }

      collect(classPrimitive.validate(classNode));

      // Validate Properties
      properties?.forEach((propDef) => {
        const primitive = new PropertyPrimitive(propDef);
        const node = primitive.find(classNode);
        if (!node) {
          issues.push(`Property '${propDef.name}' is missing in ${classConfig.name}.`);
        } else {
          collect(primitive.validate(node));
        }
      });

      // Validate Constructor
      if (constructorDef) {
        const primitive = new ConstructorPrimitive(constructorDef);
        const node = primitive.find(classNode);
        if (!node) {
          issues.push(`Constructor is missing in ${classConfig.name}.`);
        } else {
          collect(primitive.validate(node));
        }
      }

      // Validate Accessors
      accessors?.forEach((accDef) => {
        const primitive = new AccessorPrimitive(accDef);
        const node = primitive.find(classNode);
        if (!node) {
          issues.push(`Accessor '${accDef.name}' is missing in ${classConfig.name}.`);
        } else {
          collect(primitive.validate(node));
        }
      });

      // Recursive: Methods
      methods?.forEach((methodDef) => {
        const methodPrimitive = new MethodPrimitive(methodDef);

        // We need to pass the classNode to find/validate the method
        const methodNode = methodPrimitive.find(classNode);
        if (!methodNode) {
          issues.push(`Method '${methodDef.name}' is missing in ${classConfig.name}.`);
        } else {
          collect(methodPrimitive.validate(methodNode));
        }
      });
    });

    // 3. Interfaces
    definition.interfaces?.forEach((interfaceDef) => {
      const primitive = new InterfacePrimitive(interfaceDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Interface '${interfaceDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    // 4. Enums
    definition.enums?.forEach((enumDef) => {
      const primitive = new EnumPrimitive(enumDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Enum '${enumDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    // 5. Functions
    definition.functions?.forEach((funcDef) => {
      const primitive = new FunctionPrimitive(funcDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Function '${funcDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    // 6. Types
    definition.types?.forEach((typeDef) => {
      const primitive = new TypePrimitive(typeDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Type '${typeDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    // 7. Variables
    definition.variables?.forEach((varDef) => {
      const primitive = new VariablePrimitive(varDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Variable '${varDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    // 8. Modules
    definition.modules?.forEach((modDef) => {
      const primitive = new ModulePrimitive(modDef);
      const node = primitive.find(sourceFile);
      if (!node) {
        issues.push(`Module '${modDef.name}' is missing.`);
      } else {
        collect(primitive.validate(node));
      }
    });

    return { valid: issues.length === 0, issues };
  }
}
