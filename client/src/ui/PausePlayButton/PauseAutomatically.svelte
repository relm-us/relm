<script lang="ts">
  import { playState } from "~/stores/playState";

  let pausedAutomatically = false;

  function onChangeFocus(event) {
    const hasFocus = document.hasFocus();
    if ($playState === "playing" && !hasFocus) {
      pausedAutomatically = true;
      $playState = "paused";
    } else if ($playState === "paused" && hasFocus && pausedAutomatically) {
      pausedAutomatically = false;
      $playState = "playing";
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} on:focus={onChangeFocus} />
