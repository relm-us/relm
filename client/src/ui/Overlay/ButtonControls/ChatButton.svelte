<script>
import IoIosText from "svelte-icons/io/IoIosText.svelte"

import CircleButton from "~/ui/lib/CircleButton"

import { openDialog } from "~/stores/openDialog"

export let unread = null

function toggleChat() {
  $openDialog = "chat"
}
</script>

<CircleButton on:click={toggleChat}>
  <icon>
    <IoIosText />
  </icon>
  {#if unread > 0}
    <counter>
      {unread}
    </counter>
  {/if}
</CircleButton>

<style>
  icon {
    color: white;
    display: block;
    width: 32px;
    height: 32px;
  }

  icon:hover {
    color: #ddd;
  }

  counter {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0px;

    width: 28px;
    height: 28px;
    border-radius: 100%;

    color: white;
    font-weight: bold;
    background-color: var(--selected-red);
  }
</style>
