import { LocalComponent, RefType } from "~/ecs/base";

export class Impact extends LocalComponent {
  static props = {
    others: {
      type: RefType,
    },
  };
}
