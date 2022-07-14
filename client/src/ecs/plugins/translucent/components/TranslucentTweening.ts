import { Tween } from "@tweenjs/tween.js";

import { LocalComponent, RefType, NumberType } from "~/ecs/base";

export class TranslucentTweening extends LocalComponent {
  tween?: Tween<{ opacity }>;

  static props = {
    tween: {
      type: RefType,
    },
  };
}
