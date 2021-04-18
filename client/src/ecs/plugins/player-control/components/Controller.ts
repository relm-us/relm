import {
  LocalComponent,
  BooleanType,
  NumberType,
  StateComponent,
  JSONType,
} from "~/ecs/base";
import { Vector3 } from "three";
import { Vector3Type } from "~/ecs/plugins/core";
import { IDLE, WALKING, RUNNING } from "../constants";

export class Controller extends LocalComponent {
  keysEnabled: boolean;
  touchEnabled: boolean;
  torques: Array<number>;
  thrusts: Array<number>;
  animations: Array<string>;

  static props = {
    keysEnabled: {
      type: BooleanType,
      default: true,
    },
    touchEnabled: {
      type: BooleanType,
      default: false,
    },
    torques: {
      type: JSONType,
      // One torque magnitude per avatar speed
      default: [5, 5, 8],
    },
    thrusts: {
      type: JSONType,
      // One thrust magnitude per avatar speed
      default: [0, 15, 35],
    },
    animations: {
      type: JSONType,
      // One animation clipName per avatar speed
      default: [IDLE, WALKING, RUNNING],
    },
  };
}

export class ControllerState extends StateComponent {
  speed: number;
  grounded: boolean;
  direction: Vector3;

  static props = {
    speed: {
      type: NumberType,
      default: 0,
    },
    grounded: {
      type: BooleanType,
      default: true,
    },
    direction: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },
  };
}
