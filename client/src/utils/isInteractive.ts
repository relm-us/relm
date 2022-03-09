import { Entity } from "~/ecs/base";
import { Item } from "~/ecs/plugins/item";
import { Clickable, Draggable } from "~/ecs/plugins/clickable";

export function isInteractive(entity: Entity) {
  if (!entity) return false;
  return entity.has(Item) || entity.has(Clickable) || entity.has(Draggable);
}
