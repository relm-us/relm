<script lang="ts">
import { worldManager } from "~/world"

import Pane from "~/ui/lib/Pane"
import Slider from "~/ui/lib/Slider"
import { onMount } from "svelte"
import debounce from "lodash/debounce"
import { _ } from "~/i18n"

let cameraFov

function onSlideFov({ detail: value }) {
  cameraFov = value * 180
  worldManager.camera.setFov(cameraFov)
  saveFov(cameraFov)
}

const saveFov = debounce((fov) => {
  worldManager.worldDoc.settings.y.set("cameraFov", fov)
}, 500)

onMount(() => {
  cameraFov = worldManager.camera.getFov()
})
</script>

<Pane title={$_("CameraSettings.title")}>
  <r-label>{$_("CameraSettings.field_of_view")}</r-label>
  <r-setting>
    <r-slider>
      <Slider on:change={onSlideFov} value={cameraFov / 180} />
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
