// CryOS Extensions Framework
export { ExtensionRuntime, type ExtensionInstance } from './runtime';
export {
  validateManifest,
  type ExtensionManifest,
  type ExtensionLifecycleHooks,
  type ExtensionContext,
  type WalletAPI,
  type StorageAPI,
  type NotificationsAPI,
  type LoggerAPI,
  ExtensionPermission,
  ExtensionCategory,
} from './manifest';