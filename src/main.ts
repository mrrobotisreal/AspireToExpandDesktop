import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
require("dotenv").config();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");
  if (process.env.NODE_ENV === "development") {
    console.log("Loading from Webpack Dev Server at http://localhost:9000");
    mainWindow.loadURL("http://localhost:9000");
  } else {
    console.log("Loading from local index.html");
    // mainWindow.loadFile('index.html');
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }

  ipcMain.handle("get-locale", () => app.getLocale());
}

app.whenReady().then(() => createWindow());

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
