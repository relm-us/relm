import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";

import { Conversation, ConversationRef } from "../components";
import ConversationOverlay from "../ConversationOverlay.svelte";

export class ConversationSystem extends System {
  presentation: Presentation;

  order = Groups.Presentation + 250;

  static queries = {
    new: [Conversation, Not(ConversationRef)],
    modified: [Modified(Conversation), ConversationRef],
    removed: [Not(Conversation), ConversationRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta) {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(Conversation);

    // Prepare a container for Svelte
    const container = document.createElement("div");

    let component;
    const onCancel = () => {
      console.log("cancel", spec.visible, component.$$props);
      spec.visible = false;
      component.$set({ visible: false });
    };

    component = new ConversationOverlay({
      target: container,
      props: { ...spec, onCancel, entity },
    });

    entity.add(ConversationRef, { container, component });
  }

  remove(entity: Entity) {
    const conversation: ConversationRef = entity.get(ConversationRef);
    conversation.component.$destroy();
    conversation.container.remove();

    entity.remove(ConversationRef);
  }
}
