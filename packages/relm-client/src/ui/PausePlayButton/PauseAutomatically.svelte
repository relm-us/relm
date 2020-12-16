<script lang="ts">
  import { worldRunning } from "~/stores/worldRunning";

  let pausedAutomatically = false;

  function onChangeFocus(event) {
    const hasFocus = document.hasFocus();
    if ($worldRunning && !hasFocus) {
      pausedAutomatically = true;
      $worldRunning = false;
    } else if (!$worldRunning && hasFocus && pausedAutomatically) {
      pausedAutomatically = false;
      $worldRunning = true;
    }
  }
</script>

<svelte:window on:blur={onChangeFocus} on:focus={onChangeFocus} />
