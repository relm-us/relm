<script>
  import { beforeUpdate, afterUpdate } from "svelte";
  export let messages;
  export let myID;

  let div;
  let autoscroll;

  // prettier-ignore
  const colors = [
    '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
    '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff',
    '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1',
    '#000075', '#a9a9a9', '#ffffff', '#000000'
  ];

  function col(i) {
    return colors[i % colors.length];
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
          <message class:mine={true}>{message.c}</message>
        {:else}
          <message>
            <id-circle
              style="background-color:{col(message.u)}"
            />{message.c}</message
          >
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

  scroll-container {
    display: flex;
    flex-direction: column;
  }

  note {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    color: yellow;
  }

  message {
    display: flex;
    align-items: center;

    color: #333;
    background-color: #eee;

    border-radius: 9px 9px 9px 0;

    padding: 6px 10px;
    margin: 3px;
  }

  message.mine {
    color: white;
    background-color: #1277d6;

    border-radius: 9px 9px 0 9px;

    align-self: flex-end;
    text-align: right;
  }

  id-circle {
    display: block;
    flex-shrink: 0;

    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-radius: 100%;
    margin-left: 8px;
    margin-right: 8px;
  }
</style>
