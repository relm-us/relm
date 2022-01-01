<script lang="ts">
  import { playState } from "~/stores/playState";
  import { autoPause } from "~/stores/autoPause";
  import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";

  function onChangeFocus(_event) {
    const hasFocus = document.hasFocus();
    if (
      $autoPause &&
      $playState === "playing" &&
      !$uploadingDialogOpen &&
      !hasFocus
    ) {
      $playState = "paused";
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} />
