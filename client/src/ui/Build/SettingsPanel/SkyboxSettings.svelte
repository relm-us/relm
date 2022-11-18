<script lang="ts">
  import { nanoid } from "nanoid";

  import { worldManager } from "~/world";
  import { assetUrl } from "~/config/assetUrl";

  import { Entity } from "~/ecs/base";
  import { Asset } from "~/ecs/plugins/core";
  import { Skybox } from "~/ecs/plugins/skybox";

  import Pane from "~/ui/lib/Pane";
  import SkyboxOption from "./SkyboxOption.svelte";
  import SkyboxUploadButton from "~/ui/Build/shared/UploadButton";

  import { _ } from "~/i18n";

  function onUploadedSkybox({ detail }) {
    if (detail.results.length === 0) return;
    const result = detail.results[0];
    setSkybox(assetUrl(result.types.webp));
  }

  function setSkybox(imageUrl) {
    // Delete any previous Skybox object
    const entities: Entity[] =
      worldManager.world.entities.getAllByComponent(Skybox);
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

  function chooseSkybox({ detail }) {
    setSkybox(assetUrl(detail));
  }
</script>

<Pane title={$_("SkyboxSettings.title")}>
  <r-setting>
    <div class="select-skyboxes">
      <SkyboxOption
        name={$_("SkyboxSettings.blue_sky")}
        value="edc3d0040ef1e1feece33adef09b32c4-7496.webp"
        thumbnail="5edd94b3d28b8a05c2858de0ae503e39-1586.webp"
        on:choose={chooseSkybox}
      />
      <SkyboxOption
        name={$_("SkyboxSettings.stars")}
        value="42e9b44e8e2cce697d446c85809a378c-79050.webp"
        thumbnail="fdeb9a7dab4c03b2befe637d55c8ea36-6908.webp"
        on:choose={chooseSkybox}
      />
      <SkyboxOption
        name={$_("SkyboxSettings.pink_clouds")}
        value="6c798e8ce73d162955743af2dd2c27ff-22658.webp"
        thumbnail="9f15e6be6c086594fbe8e389f4a209b1-4138.webp"
        on:choose={chooseSkybox}
      />
      <SkyboxOption
        name={$_("SkyboxSettings.galaxy")}
        value="b0c5c961730f92fbd97d3b8f4ad73f53-31160.webp"
        thumbnail="543ba08c91613b380a8c304bec4f11b5-4322.webp"
        on:choose={chooseSkybox}
      />
    </div>
    <r-upload-button>
      <SkyboxUploadButton on:uploaded={onUploadedSkybox} />
    </r-upload-button>
  </r-setting>
</Pane>

<style>
  r-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
  }

  r-upload-button {
    margin: 8px auto 6px auto;
  }

  .select-skyboxes {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
