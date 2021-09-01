import { Entity } from "~/ecs/base";

import { Controller } from "./components";

export function addTouchController(entity: Entity) {
  const controller = entity.get(Controller);
  controller.touchEnabled = true;
}

export function removeTouchController(entity: Entity) {
  const controller = entity.get(Controller);
  controller.touchEnabled = false;
}
