<script lang="ts">
  import { globalEvents } from "~/events";

  function onKeydown(event) {
    if (event.target.tagName === "INPUT") return;

    if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      // "copy" event includes key repetition events
      globalEvents.emit("copy");
    } else if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      // "paste" event includes key repetition events
      globalEvents.emit("paste");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
