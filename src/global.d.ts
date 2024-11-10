export interface ElectronAPI {
  getLocale: () => Promise<string>;
  getSalt: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
