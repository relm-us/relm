<script lang="ts">
import SidePanel, { Header } from "~/ui/lib/SidePanel"
import Pane from "~/ui/lib/Pane"
import Button from "~/ui/lib/Button"
import { selectedEntities, selectedGroups } from "~/stores/selection"
import { worldManager } from "~/world"
import EntityComponents from "./EntityComponents.svelte"
import AdminAddToLibrary from "./AdminAddToLibrary.svelte"
import { permits } from "~/stores/permits"
import TransformButtons from "./TransformButtons.svelte"
import { _ } from "~/i18n"

let entity
$: $selectedEntities, (entity = worldManager.selection.getFirst())

const destroyEntity = () => {
  worldManager.worldDoc.delete(entity)
}

const debugEntity = () => {
  ;(window as any).entity = entity
  console.log(`'window.entity' available`)
}
</script>

<SidePanel on:minimize>
  <Header>{$_("EditorPanel.modify")}</Header>

  {#if $selectedEntities.size === 0}
    <info>{$_("EditorPanel.nothing_selected")}</info>
    <info>{$_("EditorPanel.click_on_object")}</info>
  {:else if $selectedEntities.size === 1 && entity}
    <EntityComponents {entity} />
    <toolbar>
      <Button on:click={destroyEntity}>
        {$_("EditorPanel.delete_object")}
      </Button>
      <div style="margin-bottom:8px" />
      <Button on:click={debugEntity}>
        {$_("EditorPanel.debug_in_console")}
      </Button>
    </toolbar>
    {#if $permits.includes("admin")}
      <AdminAddToLibrary />
    {/if}
  {:else}
    <TransformButtons />

    <Pane title="Selected">
      {$_("EditorPanel.objects", {
        values: { count: $selectedEntities.size },
      })}
    </Pane>

    {#if $permits.includes("admin")}
      <AdminAddToLibrary />
    {/if}
  {/if}
</SidePanel>

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
