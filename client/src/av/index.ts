import { config } from "~/config";

import { localAudioTrack, localVideoTrack } from "video-mirror";

import { ClientAVAdapter } from "./base/ClientAVAdapter";
import { TwilioClientAVAdapter } from "./twilio/TwilioClientAVAdapter";

export { ClientAVAdapter };

type ConnectAVOpts = {
  roomId: string;
  twilioToken: string;
  displayName: string;
  peerId: string;
  produceAudio: boolean;
  produceVideo: boolean;
};

let adapter: ClientAVAdapter;

export async function connect({
  roomId,
  twilioToken,
  displayName,
  peerId,
  produceAudio,
  produceVideo,
}: ConnectAVOpts): Promise<ClientAVAdapter> {
  if (adapter) {
    await adapter.disconnect();
  }
  adapter = new TwilioClientAVAdapter();

  await adapter.connect(twilioToken, roomId, localAudioTrack, localVideoTrack);

  return adapter;
}
