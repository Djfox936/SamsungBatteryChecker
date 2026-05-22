/**
 * Samsung Battery Checker - Secure Preload Script
 * 
 * Author: Djfox936
 * 
 * Sets up a secure bridge between the context-isolated Renderer process and the Main process.
 * Conforming to Electron security best practices (contextIsolation: true, nodeIntegration: false),
 * this script exposes highly restricted IPC methods via window.api to avoid direct Node.js access in UI.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Safely bridge isolated IPC interfaces to window.api structure
contextBridge.exposeInMainWorld('api', {
  // 1. Fetch system localization locale configurations (e.g. zh-TW, en)
  getSystemLocale: () => ipcRenderer.invoke('get-system-locale'),
  
  // 2. Fetch connected ADB target endpoints and authorization states
  getDevices: () => ipcRenderer.invoke('get-devices'),
  
  // 3. Fetch device hardware manufacturer specs to filter compatibility check
  getDeviceInfo: (deviceId) => ipcRenderer.invoke('get-device-info', deviceId),
  
  // 4. Query low-level battery specification properties via dumpsys battery
  getBatteryStats: (deviceId) => ipcRenderer.invoke('get-battery-stats', deviceId)
});
