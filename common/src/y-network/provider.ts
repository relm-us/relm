import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { GeckoProvider, WebsocketProvider } from "./index.js";

export type Options = {
  doc: Y.Doc,
  udpDoc: Y.Doc,
  connect?: boolean,
  params?: { [key: string]: any },
  WebSocketPolyfill?: typeof WebSocket,
  resyncInterval?: number
};

export type RelmURLOptions = {
  wsUrl: string,
  geckoUrl: string
};

export class RelmProvider {
  ws: WebsocketProvider;
  gecko: GeckoProvider;

  constructor(urlOptions: RelmURLOptions,
    subrelmDocId: string,
    { 
      doc,
      connect = true,
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1
    } : Options) {
      this.ws = new WebsocketProvider(urlOptions.wsUrl, subrelmDocId, doc, {
        connect,
        params,
        WebSocketPolyfill,
        resyncInterval,
        awareness: new awarenessProtocol.Awareness(doc) });

      this.gecko = new GeckoProvider(urlOptions.geckoUrl, subrelmDocId, {
        connect,
        params
      });
  }

  connect() {
    this.gecko.connect();
    this.ws.connect();
  }

  disconnect() {
    this.gecko.disconnect();
    this.ws.disconnect();
  }

}