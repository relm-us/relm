<script lang="ts">
  import { globalEvents } from "~/events";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event) {
    if (isInputEvent(event)) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();

      // "delete" event includes key repetition events
      globalEvents.emit("delete");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
