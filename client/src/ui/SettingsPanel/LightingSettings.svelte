<script lang="ts">
  import { Color } from "three";

  import { worldManager } from "~/world";

  import { Pane } from "~/ui/LeftPanel";
  import ColorPicker from "~/ui/lib/ColorPicker";
  import { onMount } from "svelte";

  let ambientColor;
  let hemisphereColor;
  let hemisphereGroundColor;
  let directionalColor;

  const onChangeColor =
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

  onMount(() => {
    ambientColor = "#" + worldManager.ambientLight.color.getHexString();
    hemisphereColor = "#" + worldManager.hemisphereLight.color.getHexString();
    hemisphereGroundColor =
      "#" + worldManager.hemisphereLight.groundColor.getHexString();
    directionalColor = "#" + worldManager.directionalLight.color.getHexString();
  });
</script>

<Pane title="Lighting">
  <r-setting>
    <r-title>
      Ambient:
      <r-right>
        <ColorPicker
          bind:value={ambientColor}
          on:change={onChangeColor(
            () => worldManager.ambientLight.color,
            "ambientLightColor"
          )}
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
            on:change={onChangeColor(
              () => worldManager.hemisphereLight.color,
              "hemisphereLightColor"
            )}
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
          on:change={onChangeColor(
            () => worldManager.hemisphereLight.groundColor,
            "hemisphereLightGroundColor"
          )}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </r-compound>
    </r-row>
  </r-setting>
  <r-setting style="border-bottom:0">
    <r-title>
      Directional:
      <r-right>
        <ColorPicker
          bind:value={directionalColor}
          on:change={onChangeColor(
            () => worldManager.directionalLight.color,
            "directionalLightColor"
          )}
          enableSwatches={true}
          enableAlpha={false}
          open={false}
          width="24px"
          height="24px"
        />
      </r-right>
    </r-title>
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
</style>
