import { decoding, encoding } from "lib0";
import { ServerChannel } from "@geckos.io/server";
import { CLIENTBOUND_MAP_SYNC_ID, CLIENTBOUND_PARTICIPANT_UPDATE_ID, decodingHandlers, encodingHandlers, SERVERBOUND_PARTICIPANT_UPDATE_ID } from "relm-common";

const clients: Set<ServerChannel> = new Set();

const send = (channel: ServerChannel, message: Uint8Array) => {
  try {
    channel.raw.emit(message);
  } catch (error) {
    console.error(`Failed to send a message to gecko participant id ${channel.userData.participantId}`, error);
    channel.close();
  }
};

export const setupGeckoConnection = async (storage: Map<string, any>, channel: ServerChannel) => {
  const { participantId } = channel.userData;
  clients.add(channel);

  channel.onRaw(buffer => {
    const message = new Uint8Array(buffer as Buffer);

    const decoder = decoding.createDecoder(message);
    const packetId = decoding.readVarUint(decoder);

    const handler = decodingHandlers[packetId];
    if (!handler) {
      console.error(`Client (${participantId}) sent invalid packet id: ${packetId}`);
      channel.close();
      return;
    }
    const data = handler(decoder);

    switch (packetId) {
      case SERVERBOUND_PARTICIPANT_UPDATE_ID:
        // Broadcast change to other clients
        storage.set(participantId, data);
        
        const encoder = encoding.createEncoder();
        encoding.writeUint8(encoder, CLIENTBOUND_PARTICIPANT_UPDATE_ID);
        encodingHandlers[CLIENTBOUND_PARTICIPANT_UPDATE_ID](encoder, storage, participantId);
        for (const client of clients) {
          if (client === channel) continue;

          send(client, encoding.toUint8Array(encoder));
        }
        break;
    }
  });

  channel.onDisconnect(() => {
    storage.delete(participantId);
    clients.delete(channel);

    // Broadcast that the participant's data should be deleted to all other channels.
    const encoder = encoding.createEncoder();
    encoding.writeUint8(encoder, CLIENTBOUND_PARTICIPANT_UPDATE_ID);
    encodingHandlers[CLIENTBOUND_PARTICIPANT_UPDATE_ID](encoder, storage, participantId);
    for (const client of clients) {
      send(client, encoding.toUint8Array(encoder));
    }
  });

  // Send the current map to the client 
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, CLIENTBOUND_MAP_SYNC_ID);
  encodingHandlers[CLIENTBOUND_MAP_SYNC_ID](encoder, storage);
  send(channel, encoding.toUint8Array(encoder));
};