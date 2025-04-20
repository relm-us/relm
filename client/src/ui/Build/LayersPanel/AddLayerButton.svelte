<script lang="ts">
import type { YReadableMap } from "relm-common"

import { _ } from "svelte-i18n"
import { nanoid } from "nanoid"

import Button from "~/ui/lib/Button"
import TextInput from "~/ui/lib/TextInput"
import { worldManager } from "~/world"

let edit = false
let newLayerName: string

function showAddLayer() {
  newLayerName = ""
  edit = true
}

function hideAddLayer() {
  edit = false
}

function addLayer() {
  const newLayerId = nanoid(10)
  worldManager.worldDoc.setLayerName(newLayerId, newLayerName)
  hideAddLayer()
}
</script>

<r-add-layer>
  {#if edit}
    <r-edit-mode>
      <r-label>
        {$_("LayersPanel.new_layer_name")}
      </r-label>
      <r-row>
        <TextInput
          bind:value={newLayerName}
          on:change={addLayer}
          on:cancel={hideAddLayer}
        />
      </r-row>
      <r-row>
        <Button on:click={addLayer}>
          {$_("LayersPanel.add")}
        </Button>
        <Button on:click={hideAddLayer} secondary={true}>
          {$_("LayersPanel.cancel")}
        </Button>
      </r-row>
    </r-edit-mode>
  {:else}
    <Button on:click={showAddLayer}>
      {$_("LayersPanel.add_layer")}
    </Button>
  {/if}
</r-add-layer>

<style>
  r-add-layer {
    display: flex;
    flex-direction: column;
    --margin: 8px;
    --font-size: 16px;
    margin-top: 12px;
  }
  r-row {
    display: flex;
    justify-content: center;
    margin: 6px 0;
  }

  r-edit-mode {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--foreground-dark-gray);
    border-radius: 3px;
    margin: 8px;
    padding: 8px 14px;
  }
  r-label {
    margin: 4px 0;
    font-size: 16px;
    color: var(--foreground-white);
  }
</style>
