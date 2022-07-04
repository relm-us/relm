import type { AuthenticationHeaders } from "relm-common";

export class RelmOAuthManager {
  url: string;
  authHeaders: AuthenticationHeaders;
  
  constructor(url, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.authHeaders = authHeaders;
  }

  open(url, callback?) {
    const openedWindow = window.open(url, null, 'width=800,height=600,resizeable');
    if (openedWindow) {
      // Listen for when the window is closed.

      const closeInterval = setInterval(() => {
        // Repeat until window was closed.
        if (openedWindow.closed) {
          clearInterval(closeInterval);
          
          if (callback) {
            callback();
          }
        }
      }, 1000);
    } else {
      throw new Error("Browser blocked opening OAuth link");
    }
  }

  getAuthenticationPayload() {
    return btoa(JSON.stringify(this.authHeaders));
  }

  showGoogleOAuth(callback?) {
    this.open(`${this.url}/auth/connect/google?state=${this.getAuthenticationPayload()}`, callback);
  }


}