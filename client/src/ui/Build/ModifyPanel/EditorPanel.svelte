<script lang="ts">
  import LeftPanel, { Header, Pane } from "~/ui/lib/LeftPanel";
  import Button from "~/ui/lib/Button";
  import { selectedEntities, selectedGroups } from "~/stores/selection";
  import { worldManager } from "~/world";
  import EntityComponents from "./EntityComponents.svelte";
  import AdminAddToLibrary from "./AdminAddToLibrary.svelte";
  import { permits } from "~/stores/permits";
  import TransformButtons from "./TransformButtons.svelte";

  let entity;
  $: $selectedEntities, (entity = worldManager.selection.getFirst());

  const destroyEntity = () => {
    worldManager.worldDoc.delete(entity);
  };

  const debugEntity = () => {
    (window as any).entity = entity;
    console.log(`'window.entity' available`);
  };
</script>

<LeftPanel on:minimize>
  <Header>Modify</Header>

  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
    <info>Click on an object to select</info>
  {:else if $selectedEntities.size === 1 && entity}
    <EntityComponents {entity} />
    <toolbar>
      <Button on:click={destroyEntity}>Delete this Object</Button>
      <div style="margin-bottom:8px" />
      <Button on:click={debugEntity}>Debug in Console</Button>
    </toolbar>
    {#if $permits.includes("admin")}
      <AdminAddToLibrary />
    {/if}
  {:else}
    <TransformButtons />

    <Pane title="Selected">
      Objects: {$selectedEntities.size}
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
    flex-direction: column;
    justify-content: center;

    margin: 8px;
    padding-top: 4px;
    --margin: 8px;
  }
</style>
