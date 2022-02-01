<script lang="ts">
  import { onMount } from "svelte";
  import { Color } from "three";

  import { worldManager } from "~/world";

  import { Pane } from "~/ui/LeftPanel";
  import ColorPicker from "~/ui/lib/ColorPicker";
  import Button from "~/ui/lib/Button";
  import { DEFAULT_DIRECTIONAL_LIGHT_POSITION } from "~/config/constants";

  let ambientColor;
  let hemisphereColor;
  let hemisphereGroundColor;
  let directionalColor;
  let directionalPosition;

  const changeColor =
    (
      getColorProperty: () => { copy: (color: Color) => void },
      settingName: string
    ) =>
    ({ detail }) => {
      const color = detail.slice(0, 7);
      const property = getColorProperty();
      console.log("change color", settingName, color, property);
      getColorProperty().copy(new Color(color));
      worldManager.worldDoc.settings.y.set(settingName, color);
    };

  const changeAmbientColor = changeColor(
    () => worldManager.ambientLight.color,
    "ambientLightColor"
  );

  const changeHemisphereColor = changeColor(
    () => worldManager.hemisphereLight.color,
    "hemisphereLightColor"
  );

  const changeHemisphereGroundColor = changeColor(
    () => worldManager.hemisphereLight.groundColor,
    "hemisphereLightGroundColor"
  );

  const changeDirectionalColor = changeColor(
    () => worldManager.directionalLight.color,
    "directionalLightColor"
  );

  $: {
    let pos;
    try {
      pos = JSON.parse(`[${directionalPosition}]`);
    } catch (err) {}
    if (pos) {
      console.log("pos", pos);
      const follow = worldManager.light.getByName("Follow");
      follow.offset.fromArray(pos);
      follow.modified();
      worldManager.worldDoc.settings.y.set("directionalLightPos", pos);
    }
  }

  function resetLighting() {
    changeAmbientColor({ detail: "#FFFFFF" });
    changeHemisphereColor({ detail: "#FFFFBB" });
    changeHemisphereGroundColor({ detail: "#080820" });
    changeDirectionalColor({ detail: "#FFFFFF" });
    directionalPosition = DEFAULT_DIRECTIONAL_LIGHT_POSITION;
  }

  onMount(() => {
    ambientColor = "#" + worldManager.ambientLight.color.getHexString();
    hemisphereColor = "#" + worldManager.hemisphereLight.color.getHexString();
    hemisphereGroundColor =
      "#" + worldManager.hemisphereLight.groundColor.getHexString();
    directionalColor = "#" + worldManager.directionalLight.color.getHexString();

    directionalPosition = JSON.stringify(
      worldManager.light.getByName("Follow").offset.toArray()
    ).slice(1, -1);
  });
</script>

<Pane title="Lighting">
  <r-setting>
    <r-title>
      Ambient:
      <r-right>
        <ColorPicker
          bind:value={ambientColor}
          on:change={changeAmbientColor}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </r-right>
    </r-title>
  </r-setting>

  <r-setting>
    <r-title>
      Hemisphere:
      <r-right>
        <r-compound>
          Sky:
          <ColorPicker
            bind:value={hemisphereColor}
            on:change={changeHemisphereColor}
            enableSwatches={true}
            enableAlpha={false}
            open={false}
            width="24px"
            height="24px"
          />
        </r-compound>
      </r-right>
    </r-title>
    <r-row>
      <r-compound>
        Ground:
        <ColorPicker
          bind:value={hemisphereGroundColor}
          on:change={changeHemisphereGroundColor}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </r-compound>
    </r-row>
  </r-setting>

  <r-setting>
    <r-title>
      Directional:
      <r-right>
        <ColorPicker
          bind:value={directionalColor}
          on:change={changeDirectionalColor}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </r-right>
    </r-title>
    <r-row-start>
      Position:
      <input type="text" bind:value={directionalPosition} />
    </r-row-start>
  </r-setting>

  <r-setting style="border-bottom:0">
    <Button on:click={resetLighting} style="border: 1px solid #999;">
      Reset Lighting
    </Button>
  </r-setting>
</Pane>

<style>
  r-setting {
    display: flex;
    flex-direction: column;
    padding: 8px 8px 8px 16px;
    border-bottom: 1px solid #999;
  }
  r-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  r-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
  r-row-start {
    display: flex;
    margin-top: 8px;
  }
  r-compound {
    display: flex;
    align-items: center;
  }

  /* Add space between ColorPicker and left labels: */
  r-compound > :global(div),
  r-right > :global(div) {
    margin-left: 8px;
    margin-right: 8px;
  }

  input {
    width: 100px;
    background-color: rgba(0, 0, 0, 0);
    color: white;
    border: 1px solid #999;
    border-radius: 2px;
    margin-left: 8px;
  }
</style>
