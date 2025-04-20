import { System, Groups, Not, type Entity, Modified } from "~/ecs/base"
import type { Presentation } from "~/ecs/plugins/core"

import { Conversation, ConversationActive, ConversationRef } from "../components"
import ConversationOverlay from "../ConversationOverlay.svelte"

export class ConversationSystem extends System {
  presentation: Presentation

  order = Groups.Presentation + 250

  static queries = {
    new: [Conversation, ConversationActive, Not(ConversationRef)],
    modified: [Modified(Conversation), ConversationRef],
    removed: [Not(Conversation), ConversationRef],
    removedActive: [Conversation, ConversationRef, Not(ConversationActive)],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update(delta) {
    this.queries.new.forEach((entity) => {
      const convo: Conversation = entity.get(Conversation)
      convo.visible = true
      this.build(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.build(entity)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })

    this.queries.removedActive.forEach((entity) => {
      const ref: ConversationRef = entity.get(ConversationRef)
      if (!ref.isClosing) {
        ref.isClosing = true

        const convo: Conversation = entity.get(Conversation)
        convo.visible = false
        ref.component.$set({ visible: false })

        setTimeout(() => {
          this.remove(entity)
        }, 400)
      } else {
        // still animating
      }
    })
  }

  build(entity: Entity) {
    const spec = entity.get(Conversation)

    // Prepare a container for Svelte
    const container = document.createElement("div")

    let component
    const onCancel = () => entity.remove(ConversationActive)

    component = new ConversationOverlay({
      target: container,
      props: { ...spec, onCancel, entity },
    })

    entity.add(ConversationRef, { container, component })
  }

  remove(entity: Entity) {
    const conversation: ConversationRef = entity.get(ConversationRef)
    conversation.component.$destroy()
    conversation.container.remove()

    entity.remove(ConversationRef)
  }
}
