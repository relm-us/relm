<script lang="ts">
import { worldManager } from "~/world"
import { audioMode } from "~/stores/audioMode"

import Pane from "~/ui/lib/Pane"
import ToggleSwitch from "~/ui/lib/ToggleSwitch"
import { _ } from "~/i18n"

let audioModeIsProximity = $audioMode === "proximity"
$: if (audioModeIsProximity) {
  $audioMode = "proximity"
  worldManager.worldDoc.settings.y.set("audioMode", "proximity")
} else {
  $audioMode = "world"
  worldManager.worldDoc.settings.y.set("audioMode", "world")
}
</script>

<Pane title={$_("AudioSettings.title")}>
  <r-label>{$_("AudioSettings.proximity_audio")}</r-label>
  <r-setting>
    <r-switch>
      <ToggleSwitch bind:enabled={audioModeIsProximity} />
    </r-switch>
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
  r-switch {
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }
</style>
