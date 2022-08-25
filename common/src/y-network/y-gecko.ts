/**
 * @module provider/websocket
 */

/* eslint-env browser */

import * as decoding from "lib0/decoding";
import * as math from "lib0/math";
import { Observable } from "lib0/observable";
import gecko, { ClientChannel } from "@geckos.io/client";
import { CLIENTBOUND_MAP_SYNC_ID, CLIENTBOUND_PARTICIPANT_UPDATE_ID, decodingHandlers, SERVERBOUND_PARTICIPANT_UPDATE_ID } from "./geckoHandlers.js";
import { isEqual } from "../utils/isEqual.js";
import { encoding } from "lib0";

const reconnectTimeoutBase = 1200;
const maxReconnectTimeout = 2500;

/**
 * Gecko Provider for Relm.
 * The document name is attached to the provided url. I.e. the following example
 * creates a gecko connection to the document id 'my-document-name'
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { GeckoProvider } from 'y-websocket'
 *   const provider = new GeckoProvider('http://localhost:1234', 'my-document-name')
 *
 * @extends {Observable<string>}
 */
export class GeckoProvider extends Observable<string> {
  url: string;
  authorization: Object;
  gecko: ClientChannel;
  geckoConnected: boolean;
  geckoConnecting: boolean;
  geckoUnsuccessfulReconnects: number;
  shouldConnect: boolean;
  storage: Map<string, any>;

  /**
   * @param {string} serverUrl
   * @param {string} docId
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   */
  constructor(
    serverUrl,
    docId,
    {
      connect = true,
      params = {}
    } = {}
  ) {
    super();
    this.authorization = {
      docId,
      ...params
    };
    this.url = serverUrl;
    this.geckoConnected = false;
    this.geckoConnecting = false;
    this.geckoUnsuccessfulReconnects = 0;
    this.gecko = null;

    if (connect) {
      this.connect();
    }
  }

  setFields(value: Object) {
    const oldState = this.getFields();

    const participantId = this.authorization["participant-id"];
    if (!this.storage[participantId]) {
      this.storage[participantId] = {};
    }

    this.storage.set(participantId, {
      ...this.storage[participantId],
      ...value
    })

    this.onUpdateFields(oldState, this.storage.get(participantId));
  }

  setField(name: string, value: any) {
    this.setFields({
      [name]: value
    });
  }

  private onUpdateFields(oldState: Object, newState: Object) {
    // Send data to gecko server IF state changed
    if (!isEqual(oldState, newState) && this.geckoConnected) {
      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, SERVERBOUND_PARTICIPANT_UPDATE_ID);
      encoding.writeVarString(encoder, JSON.stringify(newState));

      try {
        this.gecko.raw.emit(encoding.toUint8Array(encoder));
      } catch (error) {
        console.error("An error occurrerd while sending data to the gecko server.", error);
        this.gecko.close();
      }
    }
  }

  getField(name: string) {
    const participantId = this.authorization["participant-id"];

    if (!this.storage[participantId]) return;
    return this.storage[participantId][name];
  }

  getFields() {
    const participantId = this.authorization["participant-id"];

    return Object.assign({}, this.storage[participantId]);
  }

  disconnect() {
    this.shouldConnect = false;
    if (this.gecko !== null) {
      this.gecko.close();
    }
  }

  connect() {
    this.shouldConnect = true;
    if (!this.geckoConnected && this.gecko === null) {
      this._connect();
    }
  }

  private _connect() {
    if (this.shouldConnect && this.gecko === null) {
      const geckoClient = gecko({
        url: this.url,
        port: null,
        authorization: JSON.stringify(this.authorization)
      });
  
      this.gecko = geckoClient;
      this.geckoConnecting = true;
      this.geckoConnected = false;
  
      geckoClient.onRaw(event => {
        const message = new Uint8Array(event as ArrayBuffer);
        const decoder = new decoding.Decoder(message);
        
        const packetId = decoding.readUint8(decoder);
        const handler = decodingHandlers[packetId];
        
        if (!handler) {
          console.error("GeckoProvider is missing a packet handler for the id: ", packetId);
          return;
        }
        const data = handler(decoder);

        switch (packetId) {
          case CLIENTBOUND_MAP_SYNC_ID:
            this.storage = data;

            for (const participantId in this.storage) {
              this.emit("change", [ participantId, data.get(participantId) ]);
            }
            break;
          case CLIENTBOUND_PARTICIPANT_UPDATE_ID:
            if (Object.keys(data.state).length === 0) {
              this.storage.delete(data.participantId);
            } else {
              this.storage.set(data.participantId, data.state);
            }

            this.emit("change", [ data.participantId, data.state ]);
            break;
        }
      });
  
      geckoClient.onDisconnect(error => {
        console.error("y-gecko was disconnected for:", error);
        this.gecko = null;
        this.geckoConnecting = false;

        if (this.geckoConnected) {
          this.geckoConnected = false;
          this.emit("status", [ { status: "disconnected" } ]);
        } else {
          this.geckoUnsuccessfulReconnects++;
        }
  
        // Start with no reconnect timeout and increase timeout by
        // log10(wsUnsuccessfulReconnects).
        // The idea is to increase reconnect timeout slowly and have no reconnect
        // timeout at the beginning (log(1) = 0)
        setTimeout(
          () => this._connect(),
          math.min(
            math.log10(this.geckoUnsuccessfulReconnects + 1) *
              reconnectTimeoutBase,
            maxReconnectTimeout
          )
        );
      });
  
      geckoClient.onConnect(() => {
        this.geckoConnecting = false;
        this.geckoConnected = true;
        this.geckoUnsuccessfulReconnects = 0;
        this.emit("status", [ { status: "connected" } ]);
      });
  
      this.emit("status", [ { status: "connecting" } ]);
    }
  }
}
