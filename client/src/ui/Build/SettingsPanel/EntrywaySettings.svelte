<script lang="ts">
import type { Vector3 } from "three"

import { worldManager } from "~/world"

import EntrywayMap from "./EntrywayMap.svelte"
import Pane from "~/ui/lib/Pane"
import Capsule from "~/ui/lib/Capsule"
import Button from "~/ui/lib/Button"

import { _ } from "~/i18n"

let newEntrywayName = ""

function handleAddEntryway({ detail }) {
  addEntryway(detail)
  newEntrywayName = detail
  setTimeout(() => (newEntrywayName = ""), 100)
}

function addEntryway(entrywayName) {
  const coords: Vector3 = worldManager.avatar.position
  worldManager.worldDoc.entryways.y.set(entrywayName, [coords.x, coords.y, coords.z])
}

function setDefaultEntryway() {
  addEntryway("default")
}

function onDeleteEntryway({ detail: name }) {
  worldManager.worldDoc.entryways.y.delete(name)
}
</script>

<Pane title={$_("EntrywaySettings.title")}>
  <r-setting>
    <Button on:click={setDefaultEntryway}>
      {$_("EntrywaySettings.set_default")}
    </Button>
    <r-entryways-list>
      <EntrywayMap
        entryways={worldManager.worldDoc.entryways}
        on:delete={onDeleteEntryway}
      />
    </r-entryways-list>
    <div>{$_("EntrywaySettings.new_entryway_name")}</div>
    <Capsule
      value={newEntrywayName}
      editable={true}
      maxWidth={false}
      on:change={handleAddEntryway}
    />
  </r-setting>
</Pane>

<style>
  r-entryways-list {
    margin: 16px 0;
    width: 100%;
  }

  r-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
    margin-top: 8px;
    --value-width: 200px;
  }
</style>
