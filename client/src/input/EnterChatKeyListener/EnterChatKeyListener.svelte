<script lang="ts">
  import { isInputEvent } from "~/input/isInputEvent";
  import { chatOpen } from "~/stores/chatOpen";

  function onKeydown(event) {
    if (isInputEvent(event)) return;

    if (event.key === "Enter" || event.key === "Return") {
      event.preventDefault();

      chatOpen.update((value) => {
        return !value;
      });
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />
