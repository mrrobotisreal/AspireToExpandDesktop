import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electron', {
  getLocale: () => ipcRenderer.invoke('get-locale'),
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded');
});
