import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
import { LocalComponent, RefType, NumberType } from "~/ecs/base";

export class PointerPositionRef extends LocalComponent {
  value: WorldPlanes;
  updateCount: number;
  avatarMovedAt: number;

  static props = {
    value: {
      // reference to WorldPlanes
      type: RefType,
    },

    updateCount: {
      type: NumberType,
      default: 0,
    },

    avatarMovedAt: {
      type: NumberType,
      default: 0,
    },
  };
}
