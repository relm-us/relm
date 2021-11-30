import { ClientAVAdapter } from "./base/ClientAVAdapter";
import { AVConnection } from "./AVConnection";

export { ClientAVAdapter, AVConnection };

// type ConnectAVOpts = {
//   roomId: string;
//   playerId: string;
//   token?: string;
//   displayName?: string;
//   produceAudio?: boolean;
//   produceVideo?: boolean;
// };

// export async function connect({
//   roomId,
//   playerId,
//   token,
//   displayName,
//   produceAudio,
//   produceVideo,
// }: ConnectAVOpts): Promise<AVConnection> {
//   const connection = new AVConnection(playerId);

//   await connection.connect(roomId, token);

//   return connection;
// }
