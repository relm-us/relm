<script lang="ts">
  import { autoPause } from "~/stores/autoPause";
  import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";
  import { worldManager } from "~/world";

  function onChangeFocus(_event) {
    const hasFocus = document.hasFocus();
    if (
      worldManager.started &&
      $autoPause &&
      !$uploadingDialogOpen &&
      !hasFocus
    ) {
      worldManager.stop();
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} />
