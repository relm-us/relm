<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { WorldLayer } from "~/types";

  import { _ } from "svelte-i18n";
  import { worldManager } from "~/world";
  import { layerActive } from "~/stores/layerActive";

  import LayerRow from "./LayerRow.svelte";
  import { BASE_LAYER_ID } from "~/config/constants";

  export let layers: Readable<Map<string, WorldLayer>>;

  let editLayerId = null;

  const setLayerVisible = (layerId: string, visible: boolean) => () => {
    worldManager.worldDoc.setLayerVisible(layerId, visible);
  };

  const selectLayer = (layerId: string, additive: boolean) => () => {
    worldManager.selectLayer(layerId, additive);
  };

  const editLayer = (layerId: string, edit: boolean) => () => {
    if (edit) editLayerId = layerId;
    else editLayerId = null;
  };

  const setLayerName =
    (layerId: string) =>
    ({ detail: name }) => {
      worldManager.worldDoc.setLayerName(layerId, name);
      editLayerId = null;
    };

  const deleteLayer = (layerId: string) => () => {
    worldManager.worldDoc.deleteLayer(layerId);
  };

  const setLayerActive = (layerId: string) => () => {
    worldManager.setLayerActive(layerId);
  };
</script>

<r-layers>
  {#each Array.from($layers.entries()) as [layerId, attrs]}
    <LayerRow
      id={layerId}
      name={layerId === BASE_LAYER_ID ? "Base" : attrs.name}
      visible={attrs.visible}
      active={$layerActive === layerId}
      edit={editLayerId === layerId}
      on:show={setLayerVisible(layerId, true)}
      on:hide={setLayerVisible(layerId, false)}
      on:select={selectLayer(layerId, false)}
      on:selectAdd={selectLayer(layerId, true)}
      on:edit={editLayer(layerId, true)}
      on:cancelEdit={editLayer(layerId, false)}
      on:changeName={setLayerName(layerId)}
      on:delete={deleteLayer(layerId)}
      on:click={setLayerActive(layerId)}
    />
  {/each}
</r-layers>

<style>
  r-layers {
    --outline-color: var(--foreground-dark-gray);
    display: flex;
    flex-direction: column;
    margin: 4px;
    border: 1px solid var(--outline-color);
    border-radius: 3px;
  }
</style>
