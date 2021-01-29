<script lang="ts">
  import { globalEvents } from "~/events";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event) {
    if (isInputEvent(event)) return;

    if (event.key === "Tab") {
      event.preventDefault();

      // "undo" event includes key repetition events
      globalEvents.emit("switch-mode");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
