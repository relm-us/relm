<script lang="ts">
  import { playState } from "~/stores/playState";
  import { autoPause } from  "~/stores/autoPause";

  function onChangeFocus(_event) {
    const hasFocus = document.hasFocus();
    if ($autoPause && $playState === "playing" && !hasFocus) {
      $playState = "paused";
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} />
