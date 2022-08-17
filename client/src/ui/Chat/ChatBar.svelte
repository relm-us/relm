<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { worldManager } from "~/world";
  import { chatFocused, chatOpen } from "~/stores/chat";
  import { participantId } from "~/identity/participantId";

  const dispatch = createEventDispatcher();

  let inputEl;

  chatOpen.subscribe(($chatOpen) => {
    if (!inputEl) return;
    if ($chatOpen) inputEl.focus();
    else inputEl.blur();
  });

  chatFocused.subscribe(($chatFocused) => {
    if ($chatFocused && inputEl) inputEl.focus();
  });

  function addMessage(text) {
    if (text.match(/^\s*$/)) {
      dispatch("close");
    } else {
      worldManager.chat.addMessage({ 
        u: worldManager.participants.local.identityData.name,
        c: text,
        p: participantId,
        o: worldManager.participants.local.identityData.color
      });
    }
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      dispatch("close");
    } else if (event.key === "Enter" || event.key === "Return") {
      addMessage(event.target.value);
      event.target.value = "";
    }
  }

  function onBlur(event) {
    $chatFocused = false;
  }
</script>

<entry>
  <input
    type="text"
    on:blur={onBlur}
    on:keydown={onKeydown}
    bind:this={inputEl}
  />
</entry>

<style>
  entry {
    display: block;
    overflow: hidden;
  }

  input {
    border: 2px solid cornflowerblue;
    border-radius: 4px;
    width: 300px;
    padding: 1px 2px;
    font-size: 20px;
    line-height: 32px;
  }
  input:focus {
    outline: none;
  }
</style>
