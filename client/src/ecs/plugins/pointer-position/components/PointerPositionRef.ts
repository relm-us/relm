import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class PointerPositionRef extends StateComponent {
  value: WorldPlanes;
  updateCount: number;
  acknowledgedAt: number;

  static props = {
    value: {
      // reference to WorldPlanes
      type: RefType,
    },

    updateCount: {
      type: NumberType,
      default: 0,
    },

    acknowledgedAt: {
      type: NumberType,
      default: 0,
    },
  };
}
