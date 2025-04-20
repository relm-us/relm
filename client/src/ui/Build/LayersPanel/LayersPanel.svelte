<script lang="ts">
import { _ } from "svelte-i18n"
import { get } from "svelte/store"

import { worldManager } from "~/world"
import { BASE_LAYER_ID, BASE_LAYER_NAME } from "~/config/constants"

import SidePanel, { Header } from "~/ui/lib/SidePanel"
import { selectedEntities } from "~/stores/selection"
import { Entity } from "~/ecs/base"

import AddLayerButton from "./AddLayerButton.svelte"
import LayersList from "./LayersList.svelte"
import Pane from "~/ui/lib/Pane"

function getEntityLayerNames(entityIds: Set<string>) {
  const layerIds: Set<string> = new Set()
  entityIds.forEach((entityId) => {
    const entity = worldManager.getActivatedEntity(entityId)
    layerIds.add(entity.meta.layerId ?? BASE_LAYER_ID)
  })
  const layers = get(worldManager.worldDoc.getLayersDerivedStore())
  return Array.from(layerIds.values()).map((layerId) =>
    layerId === BASE_LAYER_ID ? BASE_LAYER_NAME : layers.get(layerId)?.name,
  )
}
</script>

<SidePanel on:minimize>
  <Header>{$_("LayersPanel.title")}</Header>
  <r-container>
    <LayersList layers={worldManager.worldDoc.getLayersDerivedStore()} />
    <AddLayerButton />
    {#if $selectedEntities.size > 0}
      <p />
      <Pane title={$_("LayersPanel.selected_title")}>
        <r-selected-stats>
          <div>
            {$_("LayersPanel.selected_count", {
              values: { count: $selectedEntities.size },
            })}
          </div>
          <r-layers>
            {#each getEntityLayerNames($selectedEntities) as layerName}
              <li>{layerName}</li>
            {/each}
          </r-layers>
        </r-selected-stats>
      </Pane>
    {/if}
  </r-container>
</SidePanel>

<style>
  r-container {
    display: flex;
    flex-direction: column;
  }

  r-selected-stats {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 12px;
  }

  r-layers {
    display: block;
    margin: 8px 0;
  }
</style>
