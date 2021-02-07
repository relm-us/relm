<script lang="ts">
  import { keySpace } from "../store";
  import { globalEvents } from "~/events";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event) {
    if (isInputEvent(event)) return;
    if (event.key === " ") {
      event.preventDefault();

      // "action" event includes key repetition events
      globalEvents.emit("action");

      if (event.repeat) return;

      // We only need to track "first time" key press
      keySpace.set(true);
    }
  }

  function onKeyup(event) {
    if (event.key === " ") {
      event.preventDefault();
      keySpace.set(false);
    }
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />
