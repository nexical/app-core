/* eslint-disable */
import { db } from '@/lib/core/db';
import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import { globby } from 'globby';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * DataFactory: A generic utility to bypass the API and manipulate the database directly.
 */
export class DataFactory {
  private registry: Map<string, (index: number) => any> = new Map();
  private loaded = false;
  private _client = db;

  /**
   * Sets the Prisma Client instance to use.
   * Useful for parallel testing with isolated databases.
   */
  setClient(client: any) {
    this._client = client;
  }

  /**
   * Loads all factory definitions from module integration tests.
   */
  async loadFactories() {
    if (this.loaded) return;
    console.log('[Factory] Loading factories (globby)...');

    const pattern = 'modules/**/tests/integration/factory.ts';
    const files = await globby(pattern, { cwd: process.cwd() });
    files.sort();
    console.log('[Factory] Found files:', files);

    for (const file of files) {
      try {
        const absolutePath = path.resolve(process.cwd(), file);
        const fileUrl = pathToFileURL(absolutePath).href;
        const mod = await import(fileUrl);

        if (mod.factories) {
          for (const [key, builder] of Object.entries(mod.factories)) {
            this.register(key, builder as (index: number) => any);
          }
        }
      } catch (error) {
        console.error(`[Factory] Failed to load ${file}:`, error);
      }
    }

    this.loaded = true;
    console.log('[Factory] Factories loaded.');
  }

  /**
   * Registers a factory builder for a model.
   * @param model - The model name (e.g. 'user')
   * @param builder - A function that returns default data
   */
  register(model: string, builder: (index: number) => any) {
    console.log(`[Factory] Registering model: ${model}`);
    this.registry.set(model, builder);
  }

  /**
   * Retrieves the registered builder for a model.
   * Useful for nested factories to delegate to the authoritative factory.
   */
  getBuilder(model: string): (index: number) => any {
    return this.registry.get(model) || ((_i) => ({}));
  }

  /**
   * Cleans all known models in the database in a safe order.
   * dynamically discovers models from the Prisma Schema and determines deletion order
   * based on foreign key constraints (topological sort).
   */
  async clean() {
    try {
      const models = Prisma.dmmf.datamodel.models;
      const graph = new Map<string, Set<string>>();

      models.forEach((m) => graph.set(m.name, new Set()));

      models.forEach((model) => {
        model.fields.forEach((field) => {
          if (
            field.kind === 'object' &&
            field.relationFromFields &&
            field.relationFromFields.length > 0
          ) {
            if (field.type !== model.name) {
              // Ignore self-references
              graph.get(model.name)?.add(field.type);
            }
          }
        });
      });

      const result: string[] = [];
      const recursionStack = new Set<string>();
      const visitedModels = new Set<string>();

      const dfs = (node: string) => {
        if (recursionStack.has(node)) return; // Cycle
        if (visitedModels.has(node)) return;

        recursionStack.add(node);

        const neighbors = graph.get(node) || new Set();
        for (const neighbor of neighbors) {
          dfs(neighbor);
        }

        recursionStack.delete(node);
        visitedModels.add(node);
        result.push(node);
      };

      models.forEach((m) => dfs(m.name));

      const sortedModelNames = result.reverse();

      const deleteActions = sortedModelNames
        .map((modelName) => {
          const delegate = (this._client as any)[
            modelName.charAt(0).toLowerCase() + modelName.slice(1)
          ];
          if (delegate && delegate.deleteMany) {
            return delegate.deleteMany();
          }
          return null;
        })
        .filter(Boolean); // Filter out nulls if delegate not found

      await this._client.$transaction(deleteActions as any);
    } catch (error) {
      console.error('Failed to clean database:', error);
      throw error;
    }
  }

  /**
   * Generic create method.
   * @param model - The lower-case model name e.g. 'user', 'team'
   * @param data - The data to create
   */
  async create<T = any>(model: string | keyof typeof db, data: any = {}): Promise<T> {
    await this.loadFactories();

    // Check if model property exists on client first
    if (!(model in this._client)) {
      const available = Object.keys(this._client).filter(
        (k) => !k.startsWith('$') && !k.startsWith('_'),
      );
      throw new Error(
        `Model '${String(model)}' does not exist on Prisma Client. Available: ${available.join(', ')}`,
      );
    }

    // @ts-expect-error - Dynamic indexing of Prisma client
    const delegate = this._client[model] as any;

    if (!delegate || !delegate.create) {
      throw new Error(`Model '${String(model)}' is not a valid Prisma model (no create method).`);
    }

    let defaults: Record<string, any> = {};
    const builder = this.registry.get(String(model));

    if (builder) {
      defaults = builder(Math.floor(Math.random() * 10000));
    } else {
      console.warn(
        `[Factory] No builder found for model '${String(model)}'. Available: ${Array.from(this.registry.keys()).join(', ')}`,
      );
      // throw new Error(`[Factory] No builder found for model '${String(model)}'`);
    }

    const finalData = { ...defaults, ...data };

    return delegate.create({
      data: finalData,
    });
  }

  /**
   * Expose the raw prisma client for direct access in tests
   */
  get prisma() {
    return this._client;
  }
}

export const Factory = new DataFactory();
