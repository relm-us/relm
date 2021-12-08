import { ClientAVAdapter } from "./base/ClientAVAdapter";
import { AVConnection } from './AVConnection'

export { ClientAVAdapter, AVConnection };

type ConnectAVOpts = {
  roomId: string;
  twilioToken: string;
  displayName: string;
  peerId: string;
  produceAudio: boolean;
  produceVideo: boolean;
};

export async function connect({
  roomId,
  twilioToken,
  displayName,
  peerId,
  produceAudio,
  produceVideo,
}: ConnectAVOpts): Promise<AVConnection> {
  const connection = new AVConnection();

  await connection.connect(roomId, twilioToken);

  return connection;
}
