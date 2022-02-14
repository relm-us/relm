<script lang="ts">
  import LeftPanel, { Header, Pane } from "~/ui/lib/LeftPanel";
  import Button from "~/ui/lib/Button";
  import { selectedEntities, selectedGroups } from "~/stores/selection";
  import { worldManager } from "~/world";
  import EntityComponents from "./EntityComponents.svelte";
  import AdminAddToLibrary from "./AdminAddToLibrary.svelte";

  export let permits;

  let entity;
  $: entity = worldManager.selection.getFirst($selectedEntities);

  const destroyEntity = () => {
    worldManager.worldDoc.delete(entity);
  };
</script>

<LeftPanel on:minimize>
  <Header>Modify</Header>

  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
    <info>Click on an object to select</info>
  {:else if $selectedEntities.size === 1}
    <!-- Must pass in $selectedEntities so svelte knows to re-render on new selection -->
    <EntityComponents {entity} />
    <toolbar>
      <Button on:click={destroyEntity}>Delete this Object</Button>
    </toolbar>
    {#if permits.includes("admin")}
      <AdminAddToLibrary />
    {/if}
  {:else}
    <Pane title="Selected">
      {#each [...$selectedEntities] as entityId}
        <div>{entityId}</div>
      {/each}

      {#if $selectedGroups.size > 0}
        <div>Selected groups:</div>
        {#each [...$selectedGroups] as groupId}
          <div>{groupId}</div>
        {/each}
      {/if}
    </Pane>
  {/if}
</LeftPanel>

<style>
  info {
    display: block;
    margin: 32px auto;
  }
  toolbar {
    display: flex;
    justify-content: center;

    margin-top: 8px;
    padding-top: 4px;
    --margin: 8px;
  }
</style>
