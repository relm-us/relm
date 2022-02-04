<script lang="ts">
  import LeftPanel, { Header, Pane } from "~/ui/lib/LeftPanel";
  import { selectedEntities, selectedGroups } from "~/stores/selection";
  import { worldManager } from "~/world";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";
  import EditorShowSingleEntity from "./EditorShowSingleEntity.svelte";
  import AdminAddToLibrary from "./AdminAddToLibrary.svelte";
</script>

<LeftPanel on:minimize>
  <Header>Modify</Header>

  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
    <SelectCreatePrefab />
  {:else if $selectedEntities.size === 1}
    <!-- Must pass in $selectedEntities so svelte knows to re-render on new selection -->
    <EditorShowSingleEntity
      entity={worldManager.selection.getFirst($selectedEntities)}
    />
    <AdminAddToLibrary />
  {:else}
    <Pane title="Selected">
      {#each [...$selectedEntities] as entityId}
        <div>{entityId}</div>
      {/each}
      {#each [...$selectedGroups] as groupId}
        <div>{groupId}</div>
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
