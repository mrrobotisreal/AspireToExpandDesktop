import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getLocale: () => ipcRenderer.invoke("get-locale"),
  getSalt: () => process.env.SALT,
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});
