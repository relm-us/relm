import { LocalComponent, RefType } from "~/ecs/base";

export class WebPageRef extends LocalComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
