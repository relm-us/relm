import { Entity } from "~/ecs/base";
import { Item } from "~/ecs/plugins/item";
import { Clickable, Draggable } from "~/ecs/plugins/clickable";
import { Seat } from "~/ecs/plugins/player-control";

export function isInteractive(entity: Entity) {
  if (!entity) return false;
  return entity.has(Item) || entity.has(Clickable) || entity.has(Draggable);
}

export function isInteractiveNearby(entity: Entity) {
  if (!entity) return false;
  return (
    entity.has(Item) ||
    (entity.has(Seat) && !entity.get(Seat).seated) ||
    entity.has(Clickable)
  );
}
