import type { Tween } from "@tweenjs/tween.js"

import { LocalComponent, RefType, NumberType } from "~/ecs/base"

export class TranslucentTweening extends LocalComponent {
  tween?: Tween<{ opacity: number }>

  static props = {
    tween: {
      type: RefType,
    },
  }
}
