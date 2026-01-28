// Preload script for Electron
// This runs in a secure context before the renderer process

const { contextBridge } = require('electron')

// Expose any APIs needed by the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
})
