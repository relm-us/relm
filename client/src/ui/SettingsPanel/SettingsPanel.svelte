<script lang="ts">
  import { nanoid } from "nanoid";
  import { Vector3 } from "three";

  import { Relm } from "~/stores/Relm";
  import { assetUrl } from "~/config/assetUrl";

  import { Entity } from '~/ecs/base'
  import { Asset } from "~/ecs/plugins/core";
  import { Skybox } from "~/ecs/plugins/skybox";
  
  import EntrywayMap from "./EntrywayMap.svelte";
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import UploadButton from "~/ui/ButtonControls/UploadButton";
  import Capsule from "~/ui/lib/Capsule";

  let newEntrywayName = "";

  function addEntryway(event) {
    const coords: Vector3 = $Relm.avatar.getByName("Transform").position;
    $Relm.wdoc.entryways.y.set(event.target.value, [coords.x, coords.y, coords.z]);
  }

  function onDeleteEntryway({ detail: name }) {
    $Relm.wdoc.entryways.y.delete(name)
  }

  function onUploadedSkybox({ detail }) {
    if (detail.results.length === 0) return;
    const result = detail.results[0];
    const imageUrl = assetUrl(result.types.webp);

    // Delete any previous Skybox object
    const entities: Entity[] = $Relm.world.entities.getAllByComponent(Skybox);
    for (let entity of entities) {
      $Relm.wdoc.deleteById(entity.id.toString());
    }

    // Create a new Skybox
    const skybox = $Relm.world.entities
      .create("Skybox", nanoid())
      .add(Skybox, { image: new Asset(imageUrl) })
      .activate();
    $Relm.wdoc.syncFrom(skybox);
  }
</script>

<LeftPanel on:minimize>
  <Header>Relm Settings</Header>
  <container>
    <setting>
      <h2>Skybox</h2>
      <div class="upload">
        <UploadButton on:uploaded={onUploadedSkybox}>
          <lbl>Upload</lbl>
        </UploadButton>
      </div>
    </setting>
    <setting>
      <h2>Entryways</h2>
      <EntrywayMap entryways={$Relm.wdoc.entryways} on:delete={onDeleteEntryway} />
      <Capsule
        label="Add Entryway"
        value={newEntrywayName}
        editable={true}
        on:change={addEntryway}
      />
    </setting>
  </container>
</LeftPanel>

<style>
  container {
    display: flex;
    flex-direction: column;

    height: 100%;
    overflow: hidden;
  }

  setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .upload {
    --direction: row;
    --margin: 4px;
    margin-bottom: 4px;
  }
  .upload lbl {
    margin-left: 8px;
  }
</style>
