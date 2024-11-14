export interface ElectronAPI {
  getLocale: () => Promise<string>;
  selectImage: () => Promise<string>;
  getMainServerURL: () => string;
  getVideoServerURL: () => string;
  getChatServerURL: () => string;
  getSalt: () => string;
  getCwd: () => string;
  connectChatWebSocket: (studentId: string) => void;
  sendMessage: (message: { from: string; to: string; content: string }) => void;
  onNewMessage: (callback: (message: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
