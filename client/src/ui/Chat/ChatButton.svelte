<script>
  import IoIosChatbubbles from "svelte-icons/io/IoIosChatbubbles.svelte";

  export let unread;
</script>

<button on:click>
  <icon>
    <IoIosChatbubbles />
  </icon>
  {#if $unread > 0}
    <counter>
      {$unread}
    </counter>
  {/if}
</button>

<style>
  button {
    all: unset;
    cursor: pointer;
    position: relative;
  }

  icon {
    color: white;
    display: block;
    width: 48px;
    height: 48px;
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
