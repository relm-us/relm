<script lang="ts">
  import { Color } from "three";

  import { worldManager } from "~/world";

  import { Pane } from "~/ui/lib/LeftPanel";
  import ColorPicker from "~/ui/lib/ColorPicker";
  import Slider from "~/ui/lib/Slider";
  import { onMount } from "svelte";
  import debounce from "lodash/debounce";

  let fogColor;
  let fogDensity;

  function onSlideFog({ detail }) {
    const value = detail[1];
    const fog = worldManager.world.presentation.scene.fog;
    (fog as any).density = value * 0.05;

    saveFogDensity((fog as any).density);
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

  function saveFogColor(color) {
    worldManager.worldDoc.settings.y.set("fogColor", color);
  }

  onMount(() => {
    const fog = worldManager.world.presentation.scene.fog;
    fogDensity = (fog as any).density / 0.05;
    fogColor = "#" + fog.color.getHexString();
  });
</script>

<Pane title="Fog">
  <r-setting>
    <r-slider>
      <Slider on:change={onSlideFog} value={[0, fogDensity]} single />
    </r-slider>
    <ColorPicker
      bind:value={fogColor}
      on:change={onChangeFogColor}
      enableSwatches={true}
      enableAlpha={false}
      open={false}
      width="24px"
      height="24px"
    />
  </r-setting>
</Pane>

<style>
  r-setting {
    display: flex;
    align-items: center;
    margin: 8px 8px 8px 0px;
  }
  r-slider {
    flex-grow: 1;
  }
</style>
