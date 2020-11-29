<script lang="ts">
  import { onMount } from "svelte";

  import { worldRunning } from "~/stores/worldRunning";

  let pausedAutomatically = false;

  onMount(() => {
    const interval = setInterval(() => {
      const hasFocus = document.hasFocus();
      if ($worldRunning && !hasFocus) {
        pausedAutomatically = true;
        $worldRunning = false;
      } else if (!$worldRunning && hasFocus && pausedAutomatically) {
        pausedAutomatically = false;
        $worldRunning = true;
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });
</script>
