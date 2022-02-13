import { Tween } from "@tweenjs/tween.js";

import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class TranslucentTweening extends StateComponent {
  tween?: Tween<{ opacity }>;

  static props = {
    tween: {
      type: RefType,
    },
  };
}
