<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  import Capsule from "~/ui/lib/Capsule";
  import { worldManager } from "~/world";
  import { sortAlphabetically } from "~/utils/sortAlphabetically";

  export let entity;

  const dispatch = createEventDispatcher();

  let componentOptions;
  $: componentOptions = getComponents(worldManager, entity);

  let selectedValue;

  const getComponents = (worldManager, entity) => {
    const entityComponentNames = entity.Components.map((c) => c.name);
    const components = Object.values(
      worldManager.world.components.componentsByName
    )
      .filter((Component: any) => {
        return (
          Component.editor &&
          !Component.isStateComponent &&
          !entityComponentNames.includes(Component.name)
        );
      })
      .map((Component: any) => ({
        label: Component.editor?.label || Component.name,
        value: Component.name,
      }));
    sortAlphabetically(components, (c) => c.label);
    return components;
  };

  const onSelectNewComponent = ({ detail }) => {
    const componentName = detail.value;
    setTimeout(() => {
      entity.addByName(componentName);
      worldManager.worldDoc.syncFrom(entity);
      dispatch("modified");

      componentOptions = getComponents(worldManager, entity);
      selectedValue = undefined;
    }, 300);
  };
</script>

<div>
  <info>
    <Capsule editable={false} label="ID" value={entity.id} />
  </info>
  <select-container>
    <Select
      bind:selectedValue
      placeholder="Add Component..."
      isClearable={false}
      items={componentOptions}
      on:select={onSelectNewComponent}
    />
  </select-container>
</div>

<style>
  div {
    width: 268px;
    margin: 8px 16px;
  }
  info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    margin: 0px 8px;
  }
  select-container {
    display: block;
    margin: 16px 8px 0px 8px;

    --itemColor: #333;
    --background: none;
    --height: 24px;
    --inputLeft: 0;
    --inputPadding: 0px 0px 0px 16px;
  }
</style>
