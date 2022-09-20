import { LocalComponent, NumberType, RefType, StringType } from "~/ecs/base";
import { Vector3 } from "three";

export type Destination =
  | { type: "LOCAL"; coords: Vector3 }
  | { type: "REMOTE"; entryway: string; relm: string };

export class PortalActive extends LocalComponent {
  destination: Destination;
  sparkles: any;
  countdown: number;

  static props = {
    destination: {
      type: RefType,
    },

    sparkles: {
      type: RefType,
    },

    countdown: {
      type: NumberType,
    },
  };
}
