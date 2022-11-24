<script lang="ts">
  import { Component, Entity } from "~/ecs/base";

  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  import { worldManager } from "~/world";
  import { getComponentOptions } from "~/utils/getComponentOptions";
  import alphanumeric from "alphanumeric-id";

  export let entity: Entity;

  const dispatch = createEventDispatcher();

  let componentOptions;
  $: componentOptions = getComponentOptions(entity);

  let selectedValue;

  function optionsHook(componentName) {
    if (componentName === "Document") {
      const newDocId = alphanumeric(8);
      return { docId: newDocId, pageList: [newDocId] };
    }
    return {};
  }

  const onSelectNewComponent = ({ detail }) => {
    const componentName = detail.value;
    setTimeout(() => {
      entity.addByName(componentName, optionsHook(componentName));
      const Activator = entity.world.components.activators[componentName];
      if ((Activator as any).defaultActive !== false) {
        entity.add(Activator);
      }
      worldManager.worldDoc.syncFrom(entity);
      dispatch("modified");

      componentOptions = getComponentOptions(entity);
      selectedValue = undefined;
    }, 300);
  };
</script>

<select-container>
  <Select
    bind:value={selectedValue}
    placeholder="Add Component..."
    isClearable={false}
    items={componentOptions}
    on:select={onSelectNewComponent}
  />
</select-container>

<style>
  select-container {
    display: block;
    width: 250px;
    margin-top: 16px;

    --background: none;
    --height: 24px;
  }
</style>
