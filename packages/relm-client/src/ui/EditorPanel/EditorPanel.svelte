<script lang="ts">
  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import {
    hovered,
    selectedEntities,
    selectedGroups,
  } from "~/stores/selection";
  import { worldManager } from "~/stores/worldManager";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";
  import EditorShowSingleEntity from "./EditorShowSingleEntity.svelte";
</script>

<LeftPanel on:minimize>
  <Header>Entity Editor</Header>

  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
    <SelectCreatePrefab />
  {:else if $selectedEntities.size === 1}
    <EditorShowSingleEntity entity={$worldManager.selection.entities[0]} />
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

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>
