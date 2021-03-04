<script lang="ts">
  import { globalEvents } from "~/events";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event) {
    if (isInputEvent(event)) return;
    if (event.key === "Escape") {
      // "delete" event includes key repetition events
      globalEvents.emit("escape");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
