import type { AuthenticationHeaders } from "relm-common";
import { config } from "~/config";

export type AuthenticationResponse = {
  status: "success"
} | {
  status: "error",
  reason: string,
  details?: string
};

export type SocialId = "google"|"twitter"|"facebook"|"linkedin";

export class RelmOAuthManager {
  url: string;
  authHeaders: AuthenticationHeaders;
  
  constructor(url, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.authHeaders = authHeaders;
  }

  open(url, callback?) {
    const openedWindow = window.open(url, "_blank");
    if (openedWindow) {

      // make sure that the popup was not closed.
      let closeInterval = setInterval(() => {
        if (openedWindow.closed) {
          callback(null);
          cleanUp();
        }
      }, 1000);

      // Remove timer, listener, and close popup.
      const cleanUp = () => {
        clearInterval(closeInterval);
        window.removeEventListener("message", messageListener);
        closeInterval = null;

        if (!openedWindow.closed) {
          openedWindow.close();
        }
      };
      
      // Listener for when the popup sends data back
      const messageListener = message => {
        const isFromAPI = message.origin.startsWith(config.serverUrl);
        if (isFromAPI && closeInterval !== null) {
          cleanUp();
          const data = JSON.parse(atob(message.data));
          
          if (callback) {
            callback(data);
          }
        }
      };

      // Register the message listener
      window.addEventListener("message", messageListener);
    } else {
      throw new Error("Browser blocked opening OAuth link");
    }
  }

  getAuthenticationPayload() {
    return btoa(JSON.stringify(this.authHeaders));
  }

  showGoogleOAuth(): Promise<AuthenticationResponse|null> {
    return new Promise(resolve => {
      this.open(
        `${this.url}/auth/connect/google?state=${this.getAuthenticationPayload()}`,
         resolve);
    });
  }

  showLinkedinOAuth(): Promise<AuthenticationResponse|null> {
    return new Promise(resolve => {
      this.open(
        `${this.url}/auth/connect/linkedin?state=${this.getAuthenticationPayload()}`,
         resolve);
    });
  }

  showFacebookOAuth(): Promise<AuthenticationResponse|null> {
    return new Promise(resolve => {
      this.open(
        `${this.url}/auth/connect/facebook?state=${this.getAuthenticationPayload()}`,
         resolve);
    });
  }

  showTwitterOAuth(): Promise<AuthenticationResponse|null> {
    return new Promise(resolve => {
      this.open(
        `${this.url}/auth/connect/twitter?state=${this.getAuthenticationPayload()}`,
         resolve);
    });
  }


}