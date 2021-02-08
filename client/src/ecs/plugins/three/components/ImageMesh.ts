import { StateComponent, RefType } from "~/ecs/base";

export class ImageMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
