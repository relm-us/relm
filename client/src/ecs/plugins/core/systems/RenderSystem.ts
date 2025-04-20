import type { Presentation } from "../Presentation"
import { System, Groups } from "~/ecs/base"
import { IS_BROWSER } from "../utils"
import type { Queries } from "~/ecs/base/Query"

export class RenderSystem extends System {
  presentation: Presentation

  active = IS_BROWSER
  order = Groups.Presentation + 100

  static queries: Queries = {}

  init({ presentation }) {
    this.presentation = presentation
  }

  update(delta) {
    this.presentation.update(delta)
  }
}
