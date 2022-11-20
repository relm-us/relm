import { StateComponent, RefType, BooleanType } from "~/ecs/base";

export class ConversationRef extends StateComponent {
  container: HTMLElement;
  component: any;
  isClosing: boolean;

  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },

    isClosing: {
      type: BooleanType,
      default: false,
    },
  };
}
