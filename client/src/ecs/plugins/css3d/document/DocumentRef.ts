import { LocalComponent, RefType } from "~/ecs/base";

export class DocumentRef extends LocalComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
