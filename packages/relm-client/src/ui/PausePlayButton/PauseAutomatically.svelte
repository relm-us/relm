<script lang="ts">
  import { worldState } from "~/stores/worldState";

  let pausedAutomatically = false;

  function onChangeFocus(event) {
    const hasFocus = document.hasFocus();
    if ($worldState === "running" && !hasFocus) {
      pausedAutomatically = true;
      $worldState = "paused";
    } else if ($worldState === "paused" && hasFocus && pausedAutomatically) {
      pausedAutomatically = false;
      $worldState = "running";
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} on:focus={onChangeFocus} />
