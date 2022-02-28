import { keySpace } from "~/stores/keys";
import { globalEvents } from "~/events";
import { ItemActorSystem } from "~/ecs/plugins/item/systems";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";

export function onKeydown(event) {
  if (event.key === " ") {
    event.preventDefault();

    // "action" event includes key repetition events
    globalEvents.emit("action");

    if (event.repeat) return;

    const selected = ItemActorSystem.selected;
    if (selected && selected.get(Clickable) && !selected.get(Clicked)) {
      selected.add(Clicked);
    }

    // We only need to track "first time" key press
    keySpace.set(true);
  }
}

export function onKeyup(event) {
  if (event.key === " ") {
    event.preventDefault();
    keySpace.set(false);
  }
}
