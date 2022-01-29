<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";
  import { copy } from "./copy";
  import { paste } from "./paste";

  function onCopy(event: ClipboardEvent) {
    if ($worldUIMode === "build") {
      if (copy(event.clipboardData)) {
        event.preventDefault();
      }
    }
  }
  function onPaste(event: ClipboardEvent) {
    if ($worldUIMode === "build") {
      paste(event.clipboardData || (window as any).clipboardData);
    }
  }
</script>

<svelte:window on:copy={onCopy} on:paste={onPaste} />
