<script lang="ts">
  import { Vector3 } from "three";

  import { worldManager } from "~/world";

  import EntrywayMap from "./EntrywayMap.svelte";
  import { Pane } from "~/ui/LeftPanel";
  import Capsule from "~/ui/lib/Capsule";
  import Button from "~/ui/lib/Button";

  let newEntrywayName = "";

  function handleAddEntryway(event) {
    addEntryway(event.target.value);
  }

  function addEntryway(entrywayName) {
    const coords: Vector3 = worldManager.avatar.position;
    worldManager.worldDoc.entryways.y.set(entrywayName, [
      coords.x,
      coords.y,
      coords.z,
    ]);
  }

  function setDefaultEntryway() {
    addEntryway("default");
  }

  function onDeleteEntryway({ detail: name }) {
    worldManager.worldDoc.entryways.y.delete(name);
  }
</script>

<Pane title="Entryways">
  <r-setting>
    <Button on:click={setDefaultEntryway} style="border: 1px solid #999;">
      Set Default to Here
    </Button>
    <r-entryways-list>
      <EntrywayMap
        entryways={worldManager.worldDoc.entryways}
        on:delete={onDeleteEntryway}
      />
    </r-entryways-list>
    <Capsule
      label="Add:"
      value={newEntrywayName}
      editable={true}
      on:change={handleAddEntryway}
    />
  </r-setting>
</Pane>

<style>
  r-entryways-list {
    margin: 16px 0;
  }

  r-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin: auto;
  }
</style>
