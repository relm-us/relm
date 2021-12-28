<script lang="ts">
  import { nanoid } from "nanoid";
  import { Vector3, Color } from "three";

  import { worldManager } from "~/world";
  import { assetUrl } from "~/config/assetUrl";

  import { Entity } from "~/ecs/base";
  import { Asset, Transform } from "~/ecs/plugins/core";
  import { Skybox } from "~/ecs/plugins/skybox";

  import EntrywayMap from "./EntrywayMap.svelte";
  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import UploadButton from "~/ui/ButtonControls/UploadButton";
  import Capsule from "~/ui/lib/Capsule";
  import ColorPicker from "~/ui/lib/ColorPicker";
  import Slider from "~/ui/lib/Slider";
  import Button from "~/ui/lib/Button";
  import { onMount } from "svelte";
  import debounce from "lodash/debounce";
  import { migrateToCDN } from "~/commands/migrateToCDN";

  let newEntrywayName = "";
  let fogColor;
  let fogDensity;

  function addEntryway(event) {
    const coords: Vector3 = worldManager.avatar.entity.get(Transform).position;
    worldManager.worldDoc.entryways.y.set(event.target.value, [
      coords.x,
      coords.y,
      coords.z,
    ]);
  }

  function onDeleteEntryway({ detail: name }) {
    worldManager.worldDoc.entryways.y.delete(name);
  }

  function onUploadedSkybox({ detail }) {
    if (detail.results.length === 0) return;
    const result = detail.results[0];
    const imageUrl = assetUrl(result.types.webp);

    // Delete any previous Skybox object
    const entities: Entity[] = worldManager.world.entities.getAllByComponent(Skybox);
    for (let entity of entities) {
      worldManager.worldDoc.deleteById(entity.id.toString());
    }

    // Create a new Skybox
    const skybox = worldManager.world.entities
      .create("Skybox", nanoid())
      .add(Skybox, { image: new Asset(imageUrl) })
      .activate();
    worldManager.worldDoc.syncFrom(skybox);
  }

  function onSlideFog({ detail }) {
    const value = detail[1];
    const fog = worldManager.world.presentation.scene.fog;
    fog.density = value * 0.05;

    saveFogDensity(fog.density);
  }

  const saveFogDensity = debounce((density) => {
    worldManager.worldDoc.settings.y.set("fogDensity", density);
  }, 500);

  function onChangeFogColor({ detail }) {
    const color = detail.slice(0, 7);
    const fog = worldManager.world.presentation.scene.fog;
    fog.color = new Color(color);

    saveFogColor(color);
  }

  const saveFogColor = debounce((color) => {
    worldManager.worldDoc.settings.y.set("fogColor", color);
  }, 500);

  onMount(() => {
    const fog = worldManager.world.presentation.scene.fog;
    fogDensity = fog.density / 0.05;
    fogColor = "#" + fog.color.getHexString();
  });

  function startMigrationAndReport() {
    const migrated = migrateToCDN(worldManager.world, worldManager.worldDoc);
    alert(`Migrated ${migrated} entities in this world to CDN`);
  }
</script>

<LeftPanel on:minimize>
  <Header>Relm Settings</Header>
  <container>
    <Pane title="Entryways">
      <setting>
        <EntrywayMap
          entryways={worldManager.worldDoc.entryways}
          on:delete={onDeleteEntryway}
        />
        <Capsule
          label="Add:"
          value={newEntrywayName}
          editable={true}
          on:change={addEntryway}
        />
      </setting>
    </Pane>

    <Pane title="Skybox">
      <setting>
        <div class="upload">
          <UploadButton on:uploaded={onUploadedSkybox}>
            <lbl>Upload</lbl>
          </UploadButton>
        </div>
      </setting>
    </Pane>

    <Pane title="Fog">
      <setting>
        <div style="width:100%">
          <Slider on:change={onSlideFog} value={[0, fogDensity]} single />
        </div>
        <ColorPicker
          bind:value={fogColor}
          on:change={onChangeFogColor}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </setting>
    </Pane>

    <Pane title="Migration">
      <setting>
        <div class="upload">
          <Button on:click={startMigrationAndReport}>
            Migrate Assets to CDN
          </Button>
        </div>
      </setting>
    </Pane>
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
    padding: 8px;
    margin: auto;
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
