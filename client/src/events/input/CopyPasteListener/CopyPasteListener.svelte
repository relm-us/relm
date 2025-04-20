<script lang="ts">
import { globalEvents } from "~/events/globalEvents"
import { worldUIMode } from "~/stores/worldUIMode"
import { isInputEvent } from "../isInputEvent"
import { copy } from "./copy"
import { paste } from "./paste"

const onCopy = (isCut: boolean) => (event: ClipboardEvent) => {
  if (isInputEvent(event, true)) return
  if ($worldUIMode === "build") {
    if (copy(event.clipboardData)) {
      if (isCut) globalEvents.emit("delete")
      event.preventDefault()
    }
  }
}

function onPaste(event: ClipboardEvent) {
  if (isInputEvent(event, true)) return
  if ($worldUIMode === "build") {
    paste(event.clipboardData || (window as any).clipboardData)
  }
}
</script>

<svelte:window
  on:copy={onCopy(false)}
  on:cut={onCopy(true)}
  on:paste={onPaste}
/>
