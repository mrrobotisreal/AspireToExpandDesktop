export interface ElectronAPI {
  getLocale: () => Promise<string>;
  selectImage: () => Promise<string>;
  readFile: (filePath: string) => Promise<Buffer>;
  generateKeyPair: () => Promise<{ publicKey: string; privateKey: string }>;
  getMainServerURL: () => string;
  getVideoServerURL: () => string;
  getChatServerURL: () => string;
  getChatHttpServerURL: () => string;
  getSalt: () => string;
  getCwd: () => string;
  connectChatWebSocket: (studentId: string) => void;
  sendMessage: (message: {
    from: string;
    fromID: string;
    to: string;
    toID: string;
    content: string;
    time: number;
  }) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  selectChatAttachment: () => Promise<string>;
  getMediaSources: () => Promise<Electron.DesktopCapturerSource[]>;
  loginWithGoogle: () => Promise<Credentials>;
  getStripePublishableKey: () => string;
  getPaymentServerURL: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

interface MediaTrackConstraints {
  mandatory?: {
    chromeMediaSource?: string;
    chromeMediaSourceId?: string;
  };
}

// "Credentials" is taken and copied from within the googleapis package as there is no types package available for it.
interface Credentials {
  /**
   * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
   */
  refresh_token?: string | null;
  /**
   * The time in ms at which this token is thought to expire.
   */
  expiry_date?: number | null;
  /**
   * A token that can be sent to a Google API.
   */
  access_token?: string | null;
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type?: string | null;
  /**
   * A JWT that contains identity information about the user that is digitally signed by Google.
   */
  id_token?: string | null;
  /**
   * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
   */
  scope?: string;
}
