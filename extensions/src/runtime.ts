/**
 * Extension Runtime
 * Manages extension lifecycle and sandboxed execution
 */

import { validateManifest, ExtensionManifest, ExtensionContext, ExtensionLifecycleHooks, StorageAPI, LoggerAPI } from './manifest';

export class ExtensionRuntime {
  private extensions: Map<string, ExtensionInstance> = new Map();
  private context: Omit<ExtensionContext, 'id'>;
  private loaded: boolean = false;

  constructor(private storage: StorageAPI, private logger: LoggerAPI) {
    this.context = {
      storage: this.storage,
      logger: this.logger,
    };
  }

  /**
   * Load an extension from a manifest
   */
  async load(manifest: ExtensionManifest, hooks: ExtensionLifecycleHooks): Promise<ExtensionInstance> {
    if (!validateManifest(manifest)) {
      throw new Error(`Invalid extension manifest for "${manifest.id}"`);
    }

    if (this.extensions.has(manifest.id)) {
      throw new Error(`Extension "${manifest.id}" is already loaded`);
    }

    const instance: ExtensionInstance = {
      manifest,
      hooks,
      active: false,
      loadedAt: Date.now(),
    };

    await hooks.onInstall?.({ ...this.context, id: manifest.id });
    this.extensions.set(manifest.id, instance);
    this.logger.info(`Extension "${manifest.id}" loaded`);

    return instance;
  }

  /**
   * Activate a loaded extension
   */
  async activate(id: string): Promise<void> {
    const ext = this.extensions.get(id);
    if (!ext) {
      throw new Error(`Extension "${id}" not found`);
    }

    if (ext.active) {
      this.logger.warn(`Extension "${id}" is already active`);
      return;
    }

    await ext.hooks.onActivate?.({ ...this.context, id });
    ext.active = true;
    this.logger.info(`Extension "${id}" activated`);
  }

  /**
   * Deactivate an active extension
   */
  async deactivate(id: string): Promise<void> {
    const ext = this.extensions.get(id);
    if (!ext) {
      throw new Error(`Extension "${id}" not found`);
    }

    if (!ext.active) {
      this.logger.warn(`Extension "${id}" is not active`);
      return;
    }

    await ext.hooks.onDeactivate?.({ ...this.context, id });
    ext.active = false;
    this.logger.info(`Extension "${id}" deactivated`);
  }

  /**
   * Unload an extension completely
   */
  async unload(id: string): Promise<void> {
    const ext = this.extensions.get(id);
    if (!ext) {
      throw new Error(`Extension "${id}" not found`);
    }

    if (ext.active) {
      await this.deactivate(id);
    }

    await ext.hooks.onUninstall?.({ ...this.context, id });
    this.extensions.delete(id);
    this.logger.info(`Extension "${id}" unloaded`);
  }

  /**
   * Get all loaded extensions
   */
  getAll(): ExtensionInstance[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Get active extensions only
   */
  getActive(): ExtensionInstance[] {
    return this.getAll().filter((ext) => ext.active);
  }

  /**
   * Get a specific extension
   */
  get(id: string): ExtensionInstance | undefined {
    return this.extensions.get(id);
  }

  /**
   * Check if an extension is active
   */
  isActive(id: string): boolean {
    return this.extensions.get(id)?.active ?? false;
  }
}

export interface ExtensionInstance {
  manifest: ExtensionManifest;
  hooks: ExtensionLifecycleHooks;
  active: boolean;
  loadedAt: number;
}

export default ExtensionRuntime;