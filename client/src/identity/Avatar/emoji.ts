import { Vector3 } from "three";

import { Html2d } from "~/ecs/plugins/html2d";

import { AvatarEntities } from "../types";

export function setEmoji(
  this: void,
  entities: AvatarEntities,
  emoji: string,
  isEmoting: boolean
) {
  const visible = emoji && isEmoting;
  if (visible && !entities.emoji.has(Html2d)) {
    addEmote(entities, emoji);
  } else if (visible && entities.emoji.has(Html2d)) {
    changeEmote(entities, emoji);
  } else if (!visible && entities.emoji.has(Html2d)) {
    entities.emoji.remove(Html2d);
  }
}

function addEmote(this: void, entities: AvatarEntities, content: string) {
  entities.emoji.add(Html2d, {
    kind: "EMOJI",
    content,
    hanchor: 2,
    offset: new Vector3(-0.25, 0, 0),
  });
}

function changeEmote(this: void, entities: AvatarEntities, content: string) {
  const html2d = entities.emoji.get(Html2d);
  if (!html2d) return;

  if (html2d.content !== content) {
    html2d.content = content;
    html2d.modified();
  }
}

// TODO: is this used?
export function removeEmote(this: void, entities: AvatarEntities) {
  entities.emoji.maybeRemove(Html2d);
}
