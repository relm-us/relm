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
  $: entity = getEntity($selectedEntities);

  // Regularly update our panel data
  onMount(() => {
    const interval = setInterval(() => {
      entity = getEntity($selectedEntities);
    }, UPDATE_FREQUENCY_MS);

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
    {#each entity.Components as Component}
      <ComponentPane {Component} component={entity.components.get(Component)} />
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
