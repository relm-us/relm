import { config } from "~/config";

export function getMediasoupUrl({ roomId, peerId }) {
  return `${config.mediasoupUrl}/?roomId=${roomId}&peerId=${peerId}`;
}
