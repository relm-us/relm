<script lang="ts">
  import { onMount } from "svelte";

  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import ComponentPane from "./ComponentPane.svelte";
  import { hovered, selectedEntities, selectedGroups } from "~/world/selection";

  const UPDATE_FREQUENCY_MS = 100;

  export let world;

  function getEntity(selected) {
    return (
      selected.size && world.entities.getById(selected.values().next().value)
    );
  }

  let entity;

  // This assignment tells Svelte to update everything whenever the selection changes
  $: entity = getEntity($selectedEntities);

  const refresh = () => {
    // This assignment tells Svelte to re-evalute the current selection
    entity = getEntity($selectedEntities);
  };

  const destroyComponent = (entity, Component) => {
    console.log("destroyComponent", entity.id, Component);
    entity.remove(Component);
    refresh();
  };

  // Regularly update our panel data
  onMount(() => {
    const interval = setInterval(() => refresh(), UPDATE_FREQUENCY_MS);

    return () => clearInterval(interval);
  });
</script>

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>

<LeftPanel>
  <Header>Editor</Header>
  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
  {:else if $selectedEntities.size === 1}
    {#each entity.Components as Component (Component)}
      <ComponentPane
        {Component}
        component={entity.components.get(Component)}
        on:destroy={() => destroyComponent(entity, Component)} />
    {/each}
  {:else}
    <Pane title="Selected">
      {#each [...$selectedEntities] as entityId}
        <div>{entityId}</div>
      {/each}
      {#each [...$selectedGroups] as groupId}
        <div>{groupId}</div>
      {/each}
    </Pane>
    <Pane title="Hovered">
      {#each [...$hovered] as entityId}
        <div>{entityId}</div>
      {/each}
    </Pane>
  {/if}
</LeftPanel>
