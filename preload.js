const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  appVersion: (version) => ipcRenderer.send('app-version', version),
  vpnFileOpened: (message) => ipcRenderer.send('vpn-file-loaded', message),
});
