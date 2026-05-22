/**
 * Extension Manifest Schema
 * Defines the required structure for a CryOS extension
 */

export interface ExtensionManifest {
  /** Unique identifier for the extension */
  id: string;
  /** Human-readable name */
  name: string;
  /** Extension version (semver) */
  version: string;
  /** Brief description */
  description: string;
  /** Author information */
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  /** Supported CryOS platform version (semver range) */
  compatibility: string;
  /** Entry point module */
  main: string;
  /** Permissions requested */
  permissions?: ExtensionPermission[];
  /** Supported locales */
  locales?: string[];
  /** Category for app store */
  category?: ExtensionCategory;
}

export enum ExtensionPermission {
  STORAGE = 'storage',
  NETWORK = 'network',
  NOTIFICATIONS = 'notifications',
  WALLET = 'wallet',
  IDENTITY = 'identity',
  AI = 'ai',
}

export enum ExtensionCategory {
  UTILITY = 'utility',
  FINANCE = 'finance',
  SECURITY = 'security',
  SOCIAL = 'social',
  ENTERTAINMENT = 'entertainment',
  PRODUCTIVITY = 'productivity',
  CUSTOM = 'custom',
}

export interface ExtensionLifecycleHooks {
  /** Called when extension is installed */
  onInstall?: (context: ExtensionContext) => Promise<void> | void;
  /** Called when extension is activated */
  onActivate?: (context: ExtensionContext) => Promise<void> | void;
  /** Called when extension is deactivated */
  onDeactivate?: (context: ExtensionContext) => Promise<void> | void;
  /** Called when extension is uninstalled */
  onUninstall?: (context: ExtensionContext) => Promise<void> | void;
}

export interface ExtensionContext {
  /** Extension ID */
  id: string;
  /** Crypto wallet API */
  wallet?: WalletAPI;
  /** Storage API */
  storage: StorageAPI;
  /** Notification API */
  notifications?: NotificationsAPI;
  /** Logger */
  logger: LoggerAPI;
}

export interface WalletAPI {
  /** Get connected accounts */
  getAccounts: () => Promise<string[]>;
  /** Request account connection */
  requestAccount: () => Promise<string | null>;
  /** Sign message */
  signMessage: (message: string) => Promise<string>;
  /** Send transaction */
  sendTransaction: (to: string, amount: string) => Promise<string>;
}

export interface StorageAPI {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface NotificationsAPI {
  show: (options: {
    title: string;
    body: string;
    icon?: string;
  }) => void;
  requestPermission: () => Promise<boolean>;
}

export interface LoggerAPI {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function validateManifest(manifest: unknown): manifest is ExtensionManifest {
  if (!manifest || typeof manifest !== 'object') return false;
  const m = manifest as ExtensionManifest;
  return !!(
    m.id &&
    m.name &&
    m.version &&
    m.description &&
    m.author &&
    m.compatibility &&
    m.main
  );
}

export default ExtensionManifest;