<script lang="ts">
  import { globalEvents } from "~/events";

  function onKeydown(event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON")
      return;

    if (event.key === "Tab") {
      event.preventDefault();

      // "undo" event includes key repetition events
      globalEvents.emit("switch-mode");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
