import { writable, Writable } from "svelte/store";
import { Vector3 } from "three";

type CopyBuffer = {
  center: Vector3;
  entities: Array<string>;
};

export const copyBuffer: Writable<CopyBuffer> = writable({
  center: new Vector3(),
  entities: [],
});
