import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { GeckoProvider, WebsocketProvider } from "./index.js";

type Options = {
  doc: Y.Doc,
  udpDoc: Y.Doc,
  connect?: boolean,
  params?: { [key: string]: any },
  WebSocketPolyfill?: typeof WebSocket,
  resyncInterval?: number
};

export class RelmProvider {
  ws: WebsocketProvider;
  gecko: GeckoProvider;

  constructor(url: string,
    subrelmDocId: string,
    { 
      doc,
      udpDoc,
      connect = true,
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1
    } : Options) {
      this.ws = new WebsocketProvider(url, subrelmDocId, doc, {
        connect,
        params,
        WebSocketPolyfill,
        resyncInterval,
        awareness: new awarenessProtocol.Awareness(doc) });
        
      this.gecko = new GeckoProvider(url, subrelmDocId, udpDoc, {
        connect,
        params,
        resyncInterval,
        awareness: new awarenessProtocol.Awareness(udpDoc) });
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