import { Mesh } from "three";
import { BooleanType, LocalComponent } from "~/ecs/base";

export class ItemActor extends LocalComponent {
  // Optional sphere helper shows bounds where items are considered "nearby"
  sphereHelper: Mesh;
  debug: boolean;

  static props = {
    debug: {
      type: BooleanType,
      default: false,
    },
  };
}
