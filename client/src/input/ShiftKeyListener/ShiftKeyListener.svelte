<script lang="ts">
  import { keyShift } from "../store";
  import { isInputEvent } from "~/input/isInputEvent";

  function onKeydown(event: KeyboardEvent) {
    if (isInputEvent(event)) return;
    if (event.key === "Shift") keyShift.set(true);
  }

  function onKeyup(event: KeyboardEvent) {
    if (event.key === "Shift") keyShift.set(false);
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />
