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

<container class:close={!$chatOpen} class:open={$chatOpen}>
  {#if $Relm}
    <ChatHistory messages={$Relm.chat.messages} myID={playerId} />
  {/if}
  <bottom>
    <ChatButton
      on:click={toggleChat}
      unread={$Relm && $Relm.chat.unreadCount}
    />
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
  container.open {
    transition: 0.2s;
    right: 8px;
  }
  container.close {
    transition: 0.2s;
    right: -302px;
  }

  bottom {
    display: flex;
    --margin: 2px;
  }
</style>
