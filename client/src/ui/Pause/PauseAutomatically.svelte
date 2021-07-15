<script lang="ts">
  import { playState } from "~/stores/playState";

  function onChangeFocus(_event) {
    const hasFocus = document.hasFocus();
    if ($playState === "playing" && !hasFocus) {
      $playState = "paused";
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} />
<!-- <svelte:window on:blur={onChangeFocus} on:focus={onChangeFocus} /> -->
