import { AuthenticationHeaders, Security, GeckoProvider } from "relm-common";
import { uuidv4 } from "../../utils/index.js";
import * as Y from "yjs";
import WebSocket from "ws";
import fetch from "node-fetch";

import { RelmParticipant } from "./RelmParticipant.js";

export type SocketOptions = {
  relmName: string,
  auth: {
    api: string,
    invite?: string,
    jwt?: string
  },
  bot: {
    amount: number,
    getName: (botId: number) => string,
    onConnect: (bot: RelmParticipant) => void
  }
};

// Represents an authenticated connection to a Relm.
export class RelmSocket {
  
  private options: SocketOptions;
  private authHeaders?: AuthenticationHeaders;
  private socket?: GeckoProvider;

  private bots: Map<number, RelmParticipant>;

  constructor(options: SocketOptions) {
    this.options = options;
    this.bots = new Map();
  }

  async connect() {
    const relmDocId = await this.getSubRelmDocId();
    const authHeaders = await this.getAuthHeaders();

    this.socket = new GeckoProvider(this.options.auth.api, relmDocId, new Y.Doc(), {
      params: {
        "participant-id": authHeaders["x-relm-participant-id"],
        "participant-sig": authHeaders["x-relm-participant-sig"],
        "pubkey-x": authHeaders["x-relm-pubkey-x"],
        "pubkey-y": authHeaders["x-relm-pubkey-y"],
        "invite-token": authHeaders["x-relm-token"],
        "jwt": authHeaders["x-relm-jwt"]
      },
      resyncInterval: 10000
    });
    
    await new Promise(r => {
      this.socket.on("status", ({status}) => {
        if (status === "connected") {
          // Connect all bots to socket.
          for (let botId = 0; botId < this.options.bot.amount; botId++) {
            const clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            
            const bot = new RelmParticipant({
              clientId,
              participantId: uuidv4(),
              name: this.options.bot.getName(botId),
              awareness: this.socket.awareness
            });
            bot.join();
      
            this.bots.set(clientId, bot);

            this.options.bot.onConnect(bot);
          }

          r(null);
        }
      });
    });
  }

  private async getSubRelmDocId(): Promise<string> {
    const body = JSON.stringify({
      relmName: this.options.relmName
    }, null, 2);
  
    const authHeaders = await this.getAuthHeaders();

    const response = await fetch(this.options.auth.api + "/relm/permitsAndMeta", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...authHeaders
      },
      body
    });
  
    const data: any = await response.json();
  
    if (data.status !== "success") {
      throw Error(data.reason);
    }
  
    return data.relm.permanentDocId;
  }

  private async getAuthHeaders(): Promise<AuthenticationHeaders> {
    if (this.authHeaders) {
      return this.authHeaders;
    }

    const participantId = uuidv4();
  
    let participantSecret;
    const security = new Security({
      getSecret: () => participantSecret,
      setSecret: secret => {
        participantSecret = secret;
      }
    });
    const pubkey = await security.exportPublicKey();
    const signature = await security.sign(participantId);
  
  
    const authHeaders: AuthenticationHeaders = {
      "x-relm-participant-id": participantId,
      "x-relm-participant-sig": signature,
      "x-relm-pubkey-x": pubkey.x,
      "x-relm-pubkey-y": pubkey.y
    };
  
    if (this.options.auth.invite) {
      authHeaders["x-relm-invite-token"] = this.options.auth.invite;
    }
    if (this.options.auth.jwt) {
      authHeaders["x-relm-jwt"] = this.options.auth.jwt;
    }
  
    this.authHeaders = authHeaders;
    return authHeaders;
  }

}