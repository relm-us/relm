import { LocalComponent, RefType } from "~/ecs/base";

export class Html2dRef extends LocalComponent {
  container: HTMLElement;

  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}
