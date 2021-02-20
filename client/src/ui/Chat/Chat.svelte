<script>
  import ChatButton from "./ChatButton.svelte";
  import ChatBar from "./ChatBar.svelte";
  import ChatHistory from "./ChatHistory.svelte";

  import { worldManager as wm } from "~/stores/worldManager";
  import { chatOpen } from "~/stores/chatOpen";

  let chatBar;

  function toggleChat() {
    $chatOpen = !$chatOpen;
  }

  function closeChat() {
    $chatOpen = false;
  }
</script>

<container class:close={!$chatOpen} class:open={$chatOpen}>
  {#if $wm}
    <ChatHistory messages={$wm.chat.messages} myID={$wm.wdoc.ydoc.clientID} />
  {/if}
  <bottom>
    <ChatButton on:click={toggleChat} unread={$wm && $wm.chat.unreadCount} />
    <ChatBar bind:this={chatBar} on:close={closeChat} />
  </bottom>
</container>

<style>
  container {
    position: fixed;
    right: 8px;
    bottom: 8px;
    z-index: 2;

    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  bottom {
    display: flex;
  }

  .open {
    transition: 0.2s;
    right: 8px;
  }
  .close {
    transition: 0.2s;
    right: -308px;
    /* animation: close 0.45s step-end infinite; */
  }

  slider {
    display: block;
  }
</style>
