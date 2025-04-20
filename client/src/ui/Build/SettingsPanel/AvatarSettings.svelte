<script lang="ts">
import { worldManager } from "~/world"
import { fantasySkin } from "~/stores/fantasySkin"

import Pane from "~/ui/lib/Pane"
import ToggleSwitch from "~/ui/lib/ToggleSwitch"
import { _ } from "~/i18n"

$: if ($fantasySkin) {
  worldManager.worldDoc.settings.y.set("fantasySkin", true)
} else {
  worldManager.worldDoc.settings.y.set("fantasySkin", false)
}
</script>

<Pane title={$_("AvatarSettings.title")}>
  <r-label>{$_("AvatarSettings.fantasy_skin")}</r-label>
  <r-setting>
    <r-switch>
      <ToggleSwitch bind:enabled={$fantasySkin} />
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
