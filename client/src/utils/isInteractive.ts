import type { Entity } from "~/ecs/base"
import { Item2 } from "~/ecs/plugins/item"
import { Clickable, Draggable } from "~/ecs/plugins/clickable"
import { Seat } from "~/ecs/plugins/player-control"
import { HdImage, WebPage, Document } from "~/ecs/plugins/css3d"

export function isInteractive(entity: Entity) {
  if (!entity) return false
  return entity.has(Item2) || entity.has(Clickable) || entity.has(Draggable)
}

export function isInteractiveNearby(entity: Entity) {
  if (!entity) return false
  return (
    entity.has(Item2) ||
    entity.has(Seat) ||
    entity.has(Clickable) ||
    entity.has(HdImage) ||
    entity.has(WebPage) ||
    entity.has(Document)
  )
}
