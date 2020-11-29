<script lang="ts">
  import { onMount } from "svelte";

  import { worldRunning } from "~/stores/worldRunning";

  let pausedAutomatically = false;

  // For debugging, it can be useful to set this to false
  const pauseAutomatically = true;

  onMount(() => {
    const interval = setInterval(() => {
      const hasFocus = document.hasFocus();
      if ($worldRunning && !hasFocus && pauseAutomatically) {
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
