import { StateComponent, RefType } from "~/ecs/base";

export class DocumentRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
