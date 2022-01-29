<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";
  import { copy } from "./copy";
  import { paste } from "./paste";

  function onCopy(event: ClipboardEvent) {
    if ($worldUIMode === "build") {
      copy();
    }
  }
  function onPaste(event: ClipboardEvent) {
    if ($worldUIMode === "build") {
      paste();
    }
  }
</script>

<svelte:window on:copy={onCopy} on:paste={onPaste} />
