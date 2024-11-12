import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getLocale: () => ipcRenderer.invoke("get-locale"),
  selectImage: () => ipcRenderer.invoke("select-image"),
  getMainServerURL: () => process.env.MAIN_SERVER_URL,
  getVideoServerURL: () => process.env.VIDEO_SERVER_URL,
  getChatServerURL: () => process.env.CHAT_SERVER_URL,
  getSalt: () => process.env.SALT,
  getCwd: () => process.cwd(),
  createWebSocketConnection: (url: string) => new WebSocket(url),
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});
