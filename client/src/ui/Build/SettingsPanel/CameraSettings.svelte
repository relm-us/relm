<script lang="ts">
  import { worldManager } from "~/world";

  import { Pane } from "~/ui/lib/LeftPanel";
  import Slider from "~/ui/lib/Slider";
  import { onMount } from "svelte";
  import debounce from "lodash/debounce";

  let cameraFov;

  function onSlideFov({ detail }) {
    cameraFov = detail[1] * 180;
    worldManager.camera.setFov(cameraFov);
    saveFov(cameraFov);
  }

  const saveFov = debounce((fov) => {
    worldManager.worldDoc.settings.y.set("cameraFov", fov);
  }, 500);

  onMount(() => {
    cameraFov = worldManager.camera.getFov();
  });
</script>

<Pane title="Camera">
  <r-label>Field of View:</r-label>
  <r-setting>
    <r-slider>
      <Slider on:change={onSlideFov} value={[0, cameraFov / 180]} single />
    </r-slider>
    <r-fov>
      {Math.round(cameraFov)}&deg;
    </r-fov>
  </r-setting>
</Pane>

<style>
  r-setting {
    display: flex;
    align-items: center;
    margin: 8px 8px 8px 0px;
  }
  r-label {
    display: block;
    margin-top: 8px;
  }
  r-slider {
    flex-grow: 1;
  }
  r-fov {
    display: block;
  }
</style>
