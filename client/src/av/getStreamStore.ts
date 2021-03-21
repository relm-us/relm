import { get, writable, derived, Writable } from "svelte/store";
import { peers } from "./stores/peers";
import { consumers } from "./stores/consumers";
import { types } from "mediasoup-client";
import { equals } from "~/utils/setOps";
import { roomConnectState } from "./stores/roomConnectState";
import { localStream } from "video-mirror";

type PeerId = string;
type Consumers = Array<types.Consumer>;
const peerConsumersStores: Record<PeerId, Writable<Consumers>> = {};

function findConsumer(
  consumers: Array<{ track: MediaStreamTrack }>,
  kind: string
) {
  return consumers.find((consumer) => consumer.track.kind === kind);
}

derived([peers, consumers], ([$peers, $consumers], set) => {
  for (let [peerId, peer] of Object.entries($peers)) {
    const consumersStore = getConsumersStore(peerId);
    const existingConsumers = new Set(get(consumersStore));
    const incomingConsumers = peer.consumers.map((consumerId) => {
      return $consumers[consumerId];
    });

    if (!equals(existingConsumers, incomingConsumers)) {
      consumersStore.set(incomingConsumers);
    }
  }
}).subscribe((_) => {});

export function getConsumersStore(peerId) {
  if (!(peerId in peerConsumersStores)) {
    peerConsumersStores[peerId] = writable([]);
  }
  return peerConsumersStores[peerId];
}

export function getLocalStreamStore() {
  return derived(
    [roomConnectState, localStream],
    ([$state, $stream], set) => {
      if ($state === "connected") {
        set($stream);
      } else {
        set(null);
      }
    },
    null
  );
}

export function getStreamStore(peerId) {
  const consumersStore = getConsumersStore(peerId);
  const stream = new MediaStream();
  return derived(
    [consumersStore],
    ([$consumers], set) => {
      const audioTrack = findConsumer($consumers, "audio")?.track;
      const videoTrack = findConsumer($consumers, "video")?.track;

      if (!audioTrack && !videoTrack) {
        set(null);
        return;
      }

      if (audioTrack) {
        stream.getAudioTracks().forEach((track) => {
          stream.removeTrack(track);
        });
        stream.addTrack(audioTrack);
      }

      if (videoTrack) {
        stream.getVideoTracks().forEach((track) => {
          stream.removeTrack(track);
        });
        stream.addTrack(videoTrack);
      }

      set(stream);
    },
    null
  );
}
