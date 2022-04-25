<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";
  import { isInputEvent } from "../isInputEvent";
  import { copy } from "./copy";
  import { paste } from "./paste";

  function onCopy(event: ClipboardEvent) {
    console.log("onCopy called", event);
    if (isInputEvent(event, true)) return;
    if ($worldUIMode === "build") {
      if (copy(event.clipboardData)) {
        event.preventDefault();
      }
    }
  }
  function onPaste(event: ClipboardEvent) {
    console.log("onPaste called", event);
    if (isInputEvent(event, true)) return;
    if ($worldUIMode === "build") {
      paste(event.clipboardData || (window as any).clipboardData);
    }
  }
</script>

<svelte:window on:copy={onCopy} on:paste={onPaste} />
