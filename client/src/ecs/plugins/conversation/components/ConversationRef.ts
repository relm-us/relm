import { StateComponent, RefType } from "~/ecs/base";

export class ConversationRef extends StateComponent {
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
