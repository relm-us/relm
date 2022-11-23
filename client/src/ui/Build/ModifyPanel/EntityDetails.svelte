<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";
  import { getComponentOptions } from "~/utils/getComponentOptions";

  import Capsule from "~/ui/lib/Capsule";
  import { worldManager } from "~/world";
  import alphanumeric from "alphanumeric-id";

  export let entity;

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
      worldManager.worldDoc.syncFrom(entity);
      dispatch("modified");

      componentOptions = getComponentOptions(entity);
      selectedValue = undefined;
    }, 300);
  };
</script>

<r-entity-details>
  <info>
    <Capsule editable={false} label="ID" value={entity.id} maxWidth={false} />
  </info>
  <select-container>
    <Select
      bind:value={selectedValue}
      placeholder="Add Component..."
      isClearable={false}
      items={componentOptions}
      on:select={onSelectNewComponent}
    />
  </select-container>
</r-entity-details>

<style>
  r-entity-details {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    margin: 0px 8px;
  }
  select-container {
    display: block;
    width: 250px;
    margin-top: 16px;

    --background: none;
    --height: 24px;
  }
</style>
