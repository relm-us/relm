<script lang="ts">
import { autoPause } from "~/stores/autoPause"
import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen"
import { openDialog } from "~/stores/openDialog"
import { worldManager } from "~/world"
import { globalEvents } from "~/events/globalEvents"

function onChangeFocus(_event) {
  const hasFocus = document.hasFocus()
  if (worldManager.started && $autoPause && !$openDialog && !$uploadingDialogOpen && !hasFocus) {
    worldManager.togglePaused()
  }

  // Drop all held keys
  globalEvents.emit("release-held-keys")
}
</script>

<svelte:window on:blur={onChangeFocus} />
