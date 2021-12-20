<script lang="ts">
  import { globalEvents } from "~/events";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event) {
    if (isInputEvent(event)) return;

    const isTextHighlighted = window.getSelection().type == "Range";

    if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
      if (isTextHighlighted) return;
      event.preventDefault();

      // "copy" event includes key repetition events
      globalEvents.emit("copy");
    } else if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
      if (isTextHighlighted) return;
      event.preventDefault();

      // "paste" event includes key repetition events
      globalEvents.emit("paste");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
