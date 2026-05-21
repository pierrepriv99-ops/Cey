/**
 * CryOS Station - Desktop Main Process
 * 
 * Electron main process for CryOS desktop client
 */

import { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, dialog, globalShortcut } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import log from 'electron-log';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('[Station] Starting CryOS Station...');

// Windows
let mainWindow = null;
let tray = null;

// Config store
const Store = require('electron-store');
const store = new Store({
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    minimizeToTray: true,
    launchMinimized: false,
    autoStart: false
  }
});

/**
 * Create main window
 */
function createWindow() {
  const { width, height } = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    frame: false,  // Frameless for custom titlebar
    transparent: false,
    backgroundColor: '#0a1628',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      sandbox: true
    },
    icon: join(__dirname, '../assets/icon.png'),
    show: false
  });
  
  // Load the app
  mainWindow.loadFile(join(__dirname, 'renderer/index.html'));
  
  // Show when ready
  mainWindow.once('ready-to-show', () => {
    if (!store.get('launchMinimized')) {
      mainWindow.show();
    }
    log.info('[Station] Window ready');
  });
  
  // Save window bounds
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', { width: bounds.width, height: bounds.height });
  });
  
  // Handle close
  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      log.info('[Station] Hidden to tray');
    }
  });
  
  // Create menu
  createMenu();
  
  return mainWindow;
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'CryOS Station',
      submenu: [
        { label: 'About CryOS Station', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => openSettings() },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => quit() }
      ]
    },
    {
      label: 'Wallet',
      submenu: [
        { label: 'New Wallet', accelerator: 'CmdOrCtrl+N', click: () => showView('wallet-new') },
        { label: 'Import Wallet', click: () => showView('wallet-import') },
        { type: 'separator' },
        { label: 'Send', accelerator: 'CmdOrCtrl+S', click: () => showView('wallet-send') },
        { label: 'Receive', click: () => showView('wallet-receive') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => showView('dashboard') },
        { label: 'Apps', accelerator: 'CmdOrCtrl+2', click: () => showView('apps') },
        { label: 'Messages', accelerator: 'CmdOrCtrl+3', click: () => showView('messages') },
        { type: 'separator' },
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Maximize', click: () => toggleMaximize() },
        { type: 'separator' },
        { label: 'Always on Top', type: 'checkbox', click: (item) => mainWindow?.setAlwaysOnTop(item.checked) }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => openExternal('https://docs.cryos.io') },
        { label: 'Report Issue', click: () => openExternal('https://github.com/pierrepriv99-ops/Cey/issues') },
        { type: 'separator' },
        { label: 'About', click: () => showAbout() }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Create system tray
 */
function createTray() {
  // Create tray icon (use default if no icon file)
  const iconPath = join(__dirname, '../assets/tray-icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch {
    // Create a simple placeholder
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show CryOS Station', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Wallet', submenu: [
      { label: 'Copy Address', click: () => mainWindow?.webContents.send('copy-address') },
      { label: 'View Balance', click: () => { mainWindow?.show(); showView('wallet'); }}
    ]},
    { type: 'separator' },
    { label: 'Quit', click: () => quit() }
  ]);
  
  tray.setToolTip('CryOS Station');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => mainWindow?.show());
  
  log.info('[Station] Tray created');
}

/**
 * Window controls
 */
function toggleMaximize() {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
}

function showView(view) {
  mainWindow?.webContents.send('navigate', view);
  mainWindow?.show();
}

function openSettings() {
  mainWindow?.webContents.send('navigate', 'settings');
  mainWindow?.show();
}

function quit() {
  app.isQuitting = true;
  app.quit();
}

function openExternal(url) {
  const { shell } = require('electron');
  shell.openExternal(url);
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About CryOS Station',
    message: 'CryOS Station',
    detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}`
  });
}

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-user-data-path', () => app.getPath('userData'));
ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => toggleMaximize());
ipcMain.handle('close-window', () => mainWindow?.hide());
ipcMain.handle('quit-app', () => quit());

ipcMain.handle('store-get', (_event, key) => store.get(key));
ipcMain.handle('store-set', (_event, key, value) => store.set(key, value));

ipcMain.handle('show-save-dialog', async (_event, options) => {
  return dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (_event, options) => {
  return dialog.showOpenDialog(mainWindow, options);
});

// Global exception handler
process.on('uncaughtException', (error) => {
  log.error('[Station] Uncaught Exception:', error);
  dialog.showErrorBox('Error', error.message);
});

process.on('unhandledRejection', (reason) => {
  log.error('[Station] Unhandled Rejection:', reason);
});

// App lifecycle
app.whenReady().then(() => {
  log.info('[Station] App ready');
  createWindow();
  createTray();
  
  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  log.info('[Station] Shutting down');
});

app.on('before-quit', () => {
  app.isQuitting = true;
});