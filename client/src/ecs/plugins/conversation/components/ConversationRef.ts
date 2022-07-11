import { LocalComponent, RefType } from "~/ecs/base";

export class ConversationRef extends LocalComponent {
  container: HTMLElement;
  component: any;

  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}
