/**
 * CryOS Station - Preload Script
 * 
 * Exposes safe APIs to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('station', {
  // App info
  version: () => ipcRenderer.invoke('get-app-version'),
  userDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  quit: () => ipcRenderer.invoke('quit-app'),
  
  // Store
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  
  // Dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Event listeners
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_event, view) => callback(view));
  },
  
  onCopyAddress: (callback) => {
    ipcRenderer.on('copy-address', () => callback());
  },
  
  onNotification: (callback) => {
    ipcRenderer.on('notification', (_event, data) => callback(data));
  },
  
  // Cleanup
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('navigate');
    ipcRenderer.removeAllListeners('copy-address');
    ipcRenderer.removeAllListeners('notification');
  }
});