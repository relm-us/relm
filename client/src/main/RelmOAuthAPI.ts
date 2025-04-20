import type { AuthenticationHeaders } from "relm-common"
import { config } from "~/config"

export type AuthenticationResponse =
  | {
      status: "success"
    }
  | {
      status: "failure"
      reason: string
      details?: string
    }

export type SocialType = "google" | "twitter" | "facebook" | "linkedin"

export class RelmOAuthManager {
  url: string
  authHeaders: AuthenticationHeaders

  constructor(url, authHeaders: AuthenticationHeaders) {
    this.url = url
    this.authHeaders = authHeaders
  }

  open(url, callback?) {
    const openedWindow = window.open(url, "_blank")
    if (openedWindow) {
      // make sure that the popup was not closed.
      let closeInterval = setInterval(() => {
        if (openedWindow.closed) {
          callback(null)
          cleanUp()
        }
      }, 1000)

      // Remove timer, listener, and close popup.
      const cleanUp = () => {
        clearInterval(closeInterval)
        window.removeEventListener("message", messageListener)
        closeInterval = null

        if (!openedWindow.closed) {
          openedWindow.close()
        }
      }

      // Listener for when the popup sends data back
      const messageListener = (message) => {
        const isFromAPI = message.origin.startsWith(config.serverUrl)
        if (isFromAPI && closeInterval !== null) {
          cleanUp()
          const data = JSON.parse(atob(message.data))

          if (callback) {
            callback(data)
          }
        }
      }

      // Register the message listener
      window.addEventListener("message", messageListener)
    } else {
      throw new Error("Browser blocked opening OAuth link")
    }
  }

  getAuthenticationPayload() {
    return Object.keys(this.authHeaders)
      .map((header) => `${header}=${encodeURIComponent(this.authHeaders[header])}`)
      .join("&")
  }

  async openThirdPartyWindow(type: SocialType): Promise<AuthenticationResponse> {
    const path = `/auth/connect/${type}/?${this.getAuthenticationPayload()}`
    return new Promise((resolve) => {
      this.open(`${this.url}${path}`, resolve)
    })
  }
}
