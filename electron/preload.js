const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialog functions
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // File system functions
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Menu event listeners
  onNewNote: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('new-note', listener);
    return () => ipcRenderer.removeListener('new-note', listener);
  },
  
  onSaveNote: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('save-note', listener);
    return () => ipcRenderer.removeListener('save-note', listener);
  },
  
  onSwitchTab: (callback) => {
    const listener = (event, tab) => callback(tab);
    ipcRenderer.on('switch-tab', listener);
    return () => ipcRenderer.removeListener('switch-tab', listener);
  },
  
  onOpenSettings: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('open-settings', listener);
    return () => ipcRenderer.removeListener('open-settings', listener);
  },
  
  onFind: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('find', listener);
    return () => ipcRenderer.removeListener('find', listener);
  },
  
  // Data import/export
  onExportData: (callback) => {
    const listener = (event, filePath) => callback(filePath);
    ipcRenderer.on('export-data', listener);
    return () => ipcRenderer.removeListener('export-data', listener);
  },
  
  onImportData: (callback) => {
    const listener = (event, filePath) => callback(filePath);
    ipcRenderer.on('import-data', listener);
    return () => ipcRenderer.removeListener('import-data', listener);
  },
  
  // Platform detection
  platform: process.platform,
  
  // Environment
  isDev: process.env.NODE_ENV === 'development'
});