<script>
  import ChatButton from "./ChatButton.svelte";
  import ChatBar from "./ChatBar.svelte";
  import ChatHistory from "./ChatHistory.svelte";

  import { Relm } from "~/stores/Relm";
  import { chatOpen, chatFocused } from "~/stores/chatOpen";
  import { playerId } from "~/identity/playerId";

  let chatBar;

  function toggleChat() {
    $chatOpen = !$chatOpen;
    $chatFocused = $chatOpen;
  }

  function closeChat() {
    $chatOpen = false;
    $chatFocused = false;
  }
</script>

<container class="interactive" class:close={!$chatOpen} class:open={$chatOpen}>
  <attached>
    <ChatButton
      on:click={toggleChat}
      unread={$Relm && $Relm.chat.unreadCount}
    />
  </attached>
  <slide-in>
    {#if $Relm}
      <ChatHistory messages={$Relm.chat.messages} myID={playerId} />
    {/if}
    <ChatBar bind:this={chatBar} on:close={closeChat} />
  </slide-in>
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
  container.open {
    transition: 0.2s;
    right: 8px;
  }
  container.close {
    transition: 0.2s;
    right: -312px;
  }

  attached {
    position: absolute;
    left: -80px;
    bottom: -10px;
  }
</style>
