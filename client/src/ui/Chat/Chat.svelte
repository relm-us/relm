<script>
  import ChatButton from "./ChatButton.svelte";
  import ChatBar from "./ChatBar.svelte";
  import ChatHistory from "./ChatHistory.svelte";

  import { worldManager } from "~/world";
  import { chatOpen, chatFocused } from "~/stores/chatOpen";
  import { playerId } from "~/identity/playerId";
  import { onMount } from "svelte";

  let chatBar;
  let chatManager;

  function toggleChat() {
    $chatOpen = !$chatOpen;
    $chatFocused = $chatOpen;
  }

  function closeChat() {
    $chatOpen = false;
    $chatFocused = false;
  }

  onMount(() => {
    worldManager.chatStore.subscribe(
      ($chatStore) => (chatManager = $chatStore)
    );
  });
</script>

{#if chatManager}
  <container
    class="interactive"
    class:close={!$chatOpen}
    class:open={$chatOpen}
  >
    <attached>
      <ChatButton on:click={toggleChat} unread={chatManager.unreadCount} />
    </attached>
    <slide-in>
      <ChatHistory messages={chatManager.messages} myID={playerId} />
      <ChatBar bind:this={chatBar} on:close={closeChat} />
    </slide-in>
  </container>
{/if}

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
    left: -63px;
    bottom: 4px;
  }
</style>
