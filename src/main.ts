import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import "dotenv/config";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webSecurity: false,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();

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
  ipcMain.handle("select-image", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    });
    console.log("Dialog result: ", result);

    // TODO: figure out why TS shows an error here. Testing clearly shows that the implementation below works as expected and TS clearly has the types wrong.
    // @ts-ignore
    if (result.canceled) {
      return null;
    } else {
      // @ts-ignore
      return result.filePaths[0];
    }
  });
}

app.whenReady().then(() => createWindow());

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
