<script>
  import ChatBar from "./ChatBar.svelte";
  import ChatHistory from "./ChatHistory.svelte";

  import { worldManager } from "~/world";
  import { chatOpen, chatFocused } from "~/stores/chat";
  import { playerId } from "~/identity/playerId";

  function closeChat() {
    $chatOpen = false;
    $chatFocused = false;
  }
</script>

<container class="interactive" class:close={!$chatOpen} class:open={$chatOpen}>
  <slide-in>
    <ChatHistory
      messages={worldManager.chat.messages}
      myID={playerId}
    />
    <ChatBar on:close={closeChat} />
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
</style>
