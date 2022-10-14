<script lang="ts">
  import { cleanHtml } from "~/utils/cleanHtml";
  import { getAncestor } from "~/utils/hasAncestor";
  import Message from "./Message.svelte";
  
  import { _ } from "~/i18n";

  export let messages;
  export let myID;

  let outerEl;

  function scrollToBottom(_messages, outerEl) {
    if (outerEl) {
      const scrollEl = getAncestor(outerEl, "r-scroll");
      setTimeout(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }, 0);
    }
  }

  // Automatically scroll to the bottom whenever a message is added
  $: scrollToBottom($messages, outerEl);
</script>

<r-history bind:this={outerEl}>
  {#if $messages.length === 0}
    <note>{$_("MessageHistory.empty_chat")}</note>
  {:else}
    <r-scrollable>
      {#each $messages as message}
        {#if message.u === myID}
          <message class:mine={true}>{@html cleanHtml(message.c)}</message>
        {:else}
          <Message name={message.n} content={message.c} color={message.o} />
        {/if}
      {/each}
    </r-scrollable>
  {/if}
</r-history>

<style>
  r-history {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    height: calc(100% - 54px);

    overflow-y: scroll;
  }

  message.mine :global(a),
  message.mine :global(a:visited) {
    color: yellow;
  }

  r-scrollable {
    display: flex;
    flex-direction: column;
  }

  note {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    color: #333;
  }

  message.mine {
    color: white;
    background-color: #1277d6;

    border-radius: 9px 9px 0 9px;

    align-self: flex-end;
    text-align: right;

    padding: 6px 10px;
    margin: 3px;
  }
</style>
