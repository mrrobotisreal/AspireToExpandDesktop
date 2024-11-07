export interface ElectronAPI {
  getLocale: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
