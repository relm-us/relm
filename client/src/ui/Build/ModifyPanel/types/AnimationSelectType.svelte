<script lang="ts">
  import type { Component, Entity } from "~/ecs/base";

  import { ModelRef } from "~/ecs/plugins/model";

  import SelectType from "./SelectType.svelte";

  export let key: string;
  export let component: Component;
  export let entity: Entity;
  export let prop;

  function getAllAnimationOptions(entity): { label: string; value: string }[] {
    const ref: ModelRef = entity.get(ModelRef);
    if (ref)
      return ref.value.animations.map((clip) => ({
        label: clip.name,
        value: clip.name,
      }));
    else return [];
  }

  $: prop.editor.options = getAllAnimationOptions(entity);

  // ignore warning about missing props
  $$props;
</script>

<SelectType {key} {component} {prop} on:modified />
