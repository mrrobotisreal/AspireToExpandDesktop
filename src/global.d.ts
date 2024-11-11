export interface ElectronAPI {
  getLocale: () => Promise<string>;
  selectImage: () => Promise<string>;
  getMainServerURL: () => string;
  getVideoServerURL: () => string;
  getChatServerURL: () => string;
  getSalt: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
