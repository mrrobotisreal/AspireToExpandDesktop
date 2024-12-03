import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  desktopCapturer,
  shell,
} from "electron";
import path from "path";
import WebSocket from "ws";
import fs from "fs";
import { generateKeyPairSync } from "crypto";
import { google } from "googleapis";
import "dotenv/config";

let mainWindow: BrowserWindow | null = null;
let socket: WebSocket | null = null;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost/oauth2callback";
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function connectChatWebSocket(studentId: string) {
  socket = new WebSocket(
    `${process.env.WS_CHAT_SERVER_URL}/chat?studentID=${studentId}`
  );
  console.log("Attempting Connection...");

  socket.on("open", () => {
    console.log("Successfully Connected to Chat websocket server!");
  });

  socket.on("close", (event) => {
    console.log("Client Closed Connection!");
  });

  socket.on("error", (error) => {
    console.log("Socket Error: ", error);
  });

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log("Message From Server: ", message);
    mainWindow?.webContents.send("new-message", message);
  });
}

ipcMain.on("send-message", (_, message) => {
  console.log("Sending socket message...");
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("For sure sending socket message...");
    socket.send(JSON.stringify(message));
  }

  if (socket && socket.readyState === WebSocket.CLOSED) {
    console.log("Reconnecting to chat server... Try sending message again...");
    connectChatWebSocket(message.fromID);
  }
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
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
  mainWindow.webContents.openDevTools();

  mainWindow.loadFile("index.html");
  if (process.env.NODE_ENV === "development") {
    console.log("Loading from Webpack Dev Server at http://localhost:9000");
    mainWindow.loadURL("http://localhost:9000");
  } else {
    console.log("Loading from local index.html");
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }

  ipcMain.handle("get-locale", () => app.getLocale());
  ipcMain.handle("select-image", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    });

    // TODO: figure out why TS shows an error here. Testing clearly shows that the implementation below works as expected and TS clearly has the types wrong.
    // @ts-ignore
    if (result.canceled) {
      return null;
    } else {
      // @ts-ignore
      return result.filePaths[0];
    }
  });
  ipcMain.handle("select-chat-attachment", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
      filters: [
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    // @ts-ignore
    if (result.canceled) {
      return null;
    } else {
      // @ts-ignore
      return result.filePaths[0];
    }
  });
  ipcMain.handle("read-file", async (_, filePath: string) => {
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer;
  });
  ipcMain.handle("generate-key-pair", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    console.log("Key pair successfully created!");
    return { privateKey, publicKey };
  });
  ipcMain.handle(
    "get-media-sources",
    async (_): Promise<Electron.DesktopCapturerSource[]> => {
      const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"],
        thumbnailSize: { width: 300, height: 300 },
        fetchWindowIcons: true,
      });
      return inputSources;
    }
  );
  ipcMain.handle("login-with-google", async () => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      // scope: ["https://www.googleapis.com/auth/userinfo.email"],
      scope: ["openid", "profile", "email"],
    });

    // shell.openExternal(authUrl);

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
        },
      });

      authWindow.loadURL(authUrl);

      authWindow.webContents.on("will-redirect", async (_, url) => {
        if (url.startsWith(REDIRECT_URI)) {
          const params = new URL(url).searchParams;
          console.log("Received auth code:", params.get("code"));
          const code = params.get("code");
          authWindow.close();

          try {
            const { tokens } = await oauth2Client.getToken(code!);
            console.log("Received tokens:", JSON.stringify(tokens, null, 2));
            oauth2Client.setCredentials(tokens);
            resolve(tokens);
          } catch (error) {
            console.error("Error getting tokens:", error);
            reject(error);
          }
        }
      });

      // authWindow.on("closed", () => {
      //   reject(new Error("User closed the window before login completed"));
      // });
    });
  });
}

app.whenReady().then(() => createWindow());

ipcMain.on("login", (_, studentId) => {
  connectChatWebSocket(studentId);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
