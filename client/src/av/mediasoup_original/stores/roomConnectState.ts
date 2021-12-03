import { writable, Writable } from "svelte/store";

export type RoomConnectState =
  | "new"
  | "connecting"
  | "connected"
  | "disconnected"
  | "closed";

// export type RoomState = {
//   url: string;
//   state: RoomConnectState;
//   activeSpeakerId: string;
//   statsPeerId: string;
//   faceDetection: boolean;
// };

export const roomConnectState: Writable<RoomConnectState> = writable('new')
