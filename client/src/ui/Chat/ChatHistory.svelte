<script lang="ts">
  import { afterUpdate } from "svelte";
  import { cleanHtml } from "~/utils/cleanHtml";
  import Message from "./Message.svelte";

  export let messages;
  export let myID;

  let outerEl;

  function scrollToBottom(_messages, outerEl) {
    if (outerEl)
      setTimeout(() => {
        outerEl.scrollTop = outerEl.scrollHeight;
      }, 500);
  }

  $: scrollToBottom($messages, outerEl);

  afterUpdate(() => {
    scrollToBottom($messages, outerEl);
  });
</script>

<r-chat-hist bind:this={outerEl}>
  {#if $messages.length === 0}
    <note>Empty chat history</note>
  {:else}
    <r-scrollable>
      {#each $messages as message}
        {#if message.p === myID}
          <message class:mine={true}>{@html cleanHtml(message.c)}</message>
        {:else}
          <Message name={message.u} content={message.c} color={message.o} />
        {/if}
      {/each}
    </r-scrollable>
  {/if}
</r-chat-hist>

<style>
  r-chat-hist {
    display: flex;
    flex-direction: column;

    width: 304px;
    height: 400px;
    margin-bottom: 4px;

    border: 2px solid #999;
    border-radius: 4px;
    background-color: white;

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
