import { encoding, decoding } from "lib0";

export type GeckoEncodingHandler = (
  encoder: encoding.Encoder,
  storage: Map<string, any>,
  participantId?: string
) => void;

export type GeckoDecodingHandler = (
  decoder: decoding.Decoder
) => any;

// Sent to the client when a remote participant updates their properties
export const CLIENTBOUND_PARTICIPANT_UPDATE_ID = 0;

// Sent to the client on connection to sync the existing map
export const CLIENTBOUND_MAP_SYNC_ID = 1;

// Sent to the server when a participant updates their properties
export const SERVERBOUND_PARTICIPANT_UPDATE_ID = 2;


export const encodingHandlers: { [packetId: number]: GeckoEncodingHandler } = {};
export const decodingHandlers: { [packetId: number]: GeckoDecodingHandler } = {};

decodingHandlers[CLIENTBOUND_PARTICIPANT_UPDATE_ID] = decoder => {
  const participantId = decoding.readVarString(decoder);
  const state = JSON.parse(decoding.readVarString(decoder));

  return {
    participantId,
    state
  };
};

encodingHandlers[CLIENTBOUND_PARTICIPANT_UPDATE_ID] = (encoder, storage, participantId) => {
  const state = storage.get(participantId) || {};

  encoding.writeVarString(encoder, participantId);
  encoding.writeVarString(encoder, JSON.stringify(state));
};


decodingHandlers[CLIENTBOUND_MAP_SYNC_ID] = decoder => {
  const mapContents = new Map(Object.entries(JSON.parse(decoding.readVarString(decoder))));
  
  return mapContents;
};

encodingHandlers[CLIENTBOUND_MAP_SYNC_ID] = (encoder, storage, _) => {
  encoding.writeVarString(encoder, JSON.stringify(Object.fromEntries(storage)));
};


decodingHandlers[SERVERBOUND_PARTICIPANT_UPDATE_ID] = decoder => {
  const state = JSON.parse(decoding.readVarString(decoder));

  return state;
};

encodingHandlers[SERVERBOUND_PARTICIPANT_UPDATE_ID] = (encoder, storage, participantId) => {
  const state = JSON.stringify(storage.get(participantId));
  
  encoding.writeVarString(encoder, state);
};