<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { WorldLayer } from "~/types";

  import { _ } from "svelte-i18n";
  import { worldManager } from "~/world";
  import { layerActive } from "~/stores/layerActive";

  import LayerRow from "./LayerRow.svelte";
  import { BASE_LAYER_ID, BASE_LAYER_NAME } from "~/config/constants";

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

  let sortedLayers: Array<WorldLayer & { id: string }>;

  $: {
    sortedLayers = Array.from($layers.entries()).map(([layerId, attrs]) => ({
      id: layerId,
      ...attrs,
    }));
    sortedLayers.sort((a, b) => (a.name ?? "").localeCompare(b.name));
  }
</script>

<r-layers>
  {#each sortedLayers as layer}
    <LayerRow
      id={layer.id}
      name={layer.id === BASE_LAYER_ID ? BASE_LAYER_NAME : layer.name}
      visible={layer.visible}
      active={$layerActive === layer.id}
      edit={editLayerId === layer.id}
      on:show={setLayerVisible(layer.id, true)}
      on:hide={setLayerVisible(layer.id, false)}
      on:select={selectLayer(layer.id, false)}
      on:selectAdd={selectLayer(layer.id, true)}
      on:edit={editLayer(layer.id, true)}
      on:cancelEdit={editLayer(layer.id, false)}
      on:changeName={setLayerName(layer.id)}
      on:delete={deleteLayer(layer.id)}
      on:click={setLayerActive(layer.id)}
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
