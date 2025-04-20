<script lang="ts">
import { createEventDispatcher, onMount } from "svelte"
import { worldManager } from "~/world"
import { participantId } from "~/identity/participantId"

const dispatch = createEventDispatcher()

let inputEl

function addMessage(text) {
  if (text.match(/^\s*$/)) {
    dispatch("close")
  } else {
    worldManager.chat.addMessage({
      u: participantId,
      c: text,
      n: worldManager.participants.local.identityData.name,
      o: worldManager.participants.local.identityData.color,
    })
  }
}

function onKeydown(event) {
  if (event.key === "Escape") {
    dispatch("close")
  } else if (event.key === "Enter" || event.key === "Return") {
    addMessage(event.target.value)
    event.target.value = ""
  }
}

onMount(() => {
  setTimeout(() => {
    inputEl.focus()
  }, 50)
})
</script>

<r-input>
  <input
    type="text"
    on:keydown={onKeydown}
    bind:this={inputEl}
  />
</r-input>

<style>
  r-input {
    position: absolute;
    bottom: 12px;

    display: block;
    overflow: hidden;

    width: 250px;
  }

  input {
    /* Note: 8px is (2px padding + 2px border) * 2 */
    width: calc(100% - 8px);

    padding: 1px 2px;
    border: 2px solid transparent;
    border-radius: 4px;

    font-size: 20px;
    line-height: 32px;
  }

  input:focus {
    outline: none;
    border: 2px solid cornflowerblue;
  }
</style>
