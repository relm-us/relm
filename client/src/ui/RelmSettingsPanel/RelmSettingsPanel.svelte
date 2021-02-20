<script lang="ts">
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import UploadButton from "~/ui/UploadButton";
  import { Skybox } from "~/ecs/plugins/skybox";
  import { nanoid } from "nanoid";
  import { Asset } from "~/ecs/plugins/core";
  import { Relm } from "~/stores/Relm";
  import { assetUrl } from "~/stores/config";

  function onUploadedSkybox({ detail }) {
    if (detail.results.length === 0) return;
    const result = detail.results[0];
    const imageUrl = assetUrl(result.types.webp);

    // Delete any previous Skybox object
    const entities = $Relm.world.entities.getByComponentName("Skybox");
    for (let entity of entities) {
      $Relm.wdoc.deleteById(entity.id);
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
  </container>
</LeftPanel>

<style>
  container {
    display: flex;
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
