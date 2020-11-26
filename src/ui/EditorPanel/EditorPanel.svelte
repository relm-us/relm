<script lang="ts">
  import { onMount } from "svelte";

  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import {
    hovered,
    selectedEntities,
    selectedGroups,
  } from "~/stores/selection";
  import { worldManager } from "~/stores/worldManager";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";
  import EditorShowSingleEntity from "./EditorShowSingleEntity.svelte";

  const UPDATE_FREQUENCY_MS = 100;

  function getEntity(selected) {
    if (selected.size > 0) {
      const firstId = selected.values().next().value;
      return $worldManager.world.entities.getById(firstId);
    }
  }

  let entity;

  const refresh = (selected) => {
    const maybeEntity = getEntity(selected);
    if (maybeEntity) {
      entity = maybeEntity;
    }
  };

  // update everything whenever the selection changes
  $: refresh($selectedEntities);

  // Regularly update our panel data
  onMount(() => {
    const interval = setInterval(
      () => refresh($selectedEntities),
      UPDATE_FREQUENCY_MS
    );
    return () => clearInterval(interval);
  });
</script>

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>

<LeftPanel on:minimize>
  <Header>Entity Editor</Header>

  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
    <SelectCreatePrefab />
  {:else if $selectedEntities.size === 1}
    <EditorShowSingleEntity {entity} />
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
