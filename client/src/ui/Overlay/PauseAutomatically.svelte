<script lang="ts">
  import { autoPause } from "~/stores/autoPause";
  import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";
  import { openDialog } from "~/stores/openDialog";
  import { worldManager } from "~/world";

  function onChangeFocus(_event) {
    const hasFocus = document.hasFocus();
    if (
      worldManager.started &&
      $autoPause &&
      !$openDialog &&
      !$uploadingDialogOpen &&
      !hasFocus
    ) {
      worldManager.togglePaused();
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} />
