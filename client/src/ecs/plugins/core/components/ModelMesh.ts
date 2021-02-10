import { StateComponent, RefType } from "~/ecs/base";

export class ModelMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
