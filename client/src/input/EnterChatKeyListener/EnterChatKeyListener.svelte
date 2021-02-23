<script lang="ts">
  import { isInputEvent } from "~/input/isInputEvent";
  import { chatOpen, chatFocused } from "~/stores/chatOpen";

  function onKeydown(event) {
    if (isInputEvent(event)) return;

    if (event.key === "Enter" || event.key === "Return") {
      event.preventDefault();

      chatOpen.set(true);
      chatFocused.set(true);
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
