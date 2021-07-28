import { writable, Writable, derived, Readable } from "svelte/store";
import { types } from "mediasoup-client";

type ProducersRecord = Record<string, types.Producer>;

export const producers: Writable<ProducersRecord> = writable({});

function getProducer($producers: ProducersRecord, kind: string) {
  return Object.values($producers).find(
    (producer) => producer.track.kind === kind
  );
}

export const audioProducing: Readable<boolean> = derived(
  producers,
  ($producers, set) => {
    const producer = getProducer($producers, "audio");
    set(producer && !producer.paused && !producer.track.muted);
  }
);

export const videoProducing: Readable<boolean> = derived(
  producers,
  ($producers, set) => {
    const producer = getProducer($producers, "video");
    set(producer && !producer.paused && !producer.track.muted);
  }
);

// producers.subscribe(($p) => console.log("producers", $p));
// audioProducing.subscribe(($p) => console.log("audioProducing", $p));
// videoProducing.subscribe(($p) => console.log("videoProducing", $p));
