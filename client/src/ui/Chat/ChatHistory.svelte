<script>
  import { beforeUpdate, afterUpdate } from "svelte";
  import { worldManager } from "~/world";
  import { cleanHtml } from "~/utils/cleanHtml";
  import Message from "./Message.svelte";

  export let messages;
  export let myID;

  let div;
  let autoscroll;

  function getIdentity(playerId) {
    return worldManager.identities.get(playerId);
  }

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
    }
  });

</script>

<container bind:this={div}>
  {#if $messages.length === 0}
    <note>Empty chat history</note>
  {:else}
    <scroll-container>
      {#each $messages as message}
        {#if message.u === myID}
          <message class:mine={true}>{@html cleanHtml(message.c)}</message>
        {:else}
          <Message identity={getIdentity(message.u)} content={message.c} />
        {/if}
      {/each}
    </scroll-container>
  {/if}
</container>

<style>
  container {
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

  scroll-container {
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
