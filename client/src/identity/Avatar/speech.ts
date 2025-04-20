import { Vector3 } from "three"

import { Html2d } from "~/ecs/plugins/html2d"

import type { AvatarEntities } from "~/types"

export function setSpeech(
  this: void,
  entities: AvatarEntities,
  message: string,
  isSpeaking: boolean,
  onClose: () => void,
) {
  const visible = !!message && isSpeaking
  if (visible && !entities.head.has(Html2d)) {
    addSpeech(entities, message, onClose)
  } else if (visible && entities.head.has(Html2d)) {
    changeSpeech(entities, message)
  } else if (!visible && entities.head.has(Html2d)) {
    entities.head.remove(Html2d)
  }
}

function addSpeech(this: void, entities: AvatarEntities, message: string, onClose: () => void) {
  entities.head.add(Html2d, {
    kind: "SPEECH",
    content: message,
    offset: new Vector3(0.5, 0, 0),
    hanchor: 1,
    vanchor: 2,
    onClose,
  })
}

function changeSpeech(this: void, entities: AvatarEntities, message: string) {
  const label = entities.head.get(Html2d)
  if (!label) return

  if (label.content !== message) {
    label.content = message
    label.modified()
  }
}
