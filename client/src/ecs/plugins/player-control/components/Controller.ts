import { LocalComponent, BooleanType, JSONType, RefType } from "~/ecs/base"
import { IDLE, WALKING, RUNNING, FLYING } from "~/config/constants"

export class Controller extends LocalComponent {
  keysEnabled: boolean
  canFly: boolean
  torques: Array<number>
  thrusts: Array<number>
  angDamps: Array<number>
  linDamps: Array<number>
  animations: Array<string>
  onActivity: () => void

  static props = {
    keysEnabled: {
      type: BooleanType,
      default: true,
    },

    canFly: {
      type: BooleanType,
      default: false,
    },

    torques: {
      type: JSONType,
      // One torque magnitude per avatar speed, plus flying
      default: [3, 3, 4, /* flying */ 3],
    },

    thrusts: {
      type: JSONType,
      // One thrust magnitude per avatar speed, plus flying
      default: [0, 11.5, 30, /* flying */ 8],
    },

    angDamps: {
      type: JSONType,
      // One angular damping per avatar speed, plus flying
      default: [25, 25, 25, /* flying */ 25],
    },

    linDamps: {
      type: JSONType,
      // One linear damping per avatar speed, plus flying
      default: [12, 12, 12, /* flying */ 0.75],
    },

    animations: {
      type: JSONType,
      // One animation clipName per avatar speed
      default: [IDLE, WALKING, RUNNING, /* flying */ FLYING],
    },

    onActivity: {
      type: RefType,
      default: null,
    },
  }
}
