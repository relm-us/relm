<script>
  import { fly, slide } from "svelte/transition";
  import IoIosChatbubbles from "svelte-icons/io/IoIosChatbubbles.svelte";
  import { chatOpen } from "~/stores/chat";
  import { worldManager as wm } from "~/stores/worldManager";
  import { makeLabel } from "~/prefab";

  function createLabel(text) {
    const position = $wm.avatar.getByName("WorldTransform").position;
    const label = makeLabel($wm.world, {
      x: position.x,
      z: position.z,
      content: text,
    }).activate();
    $wm.wdoc.syncFrom(label);
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      $chatOpen = false;
    } else if (event.key === "Enter" || event.key === "Return") {
      createLabel(event.target.value);
      event.target.value = "";
    }
  }

  function onClick(event) {
    $chatOpen = !$chatOpen;
  }

  function onBlur(event) {
    $chatOpen = false;
  }

  function init(el) {
    el.focus();
  }
</script>

<container>
  <button on:click={onClick}>
    <icon>
      <IoIosChatbubbles />
    </icon>
  </button>
  {#if $chatOpen}
    <entry transition:slide>
      <input type="text" on:blur={onBlur} on:keydown={onKeydown} use:init />
    </entry>
  {/if}
</container>

<style>
  container {
    position: fixed;
    right: 8px;
    bottom: 8px;
    z-index: 1;

    display: flex;
    align-items: center;
  }

  button {
    all: unset;
    cursor: pointer;
  }

  icon {
    color: var(--foreground-white);
    display: block;
    width: 48px;
    height: 48px;
  }

  icon:hover {
    color: var(--selected-red);
  }

  entry {
    display: block;
    overflow: hidden;
  }

  input {
    border: 2px solid cornflowerblue;
    border-radius: 4px;
    width: 300px;
    font-size: 20px;
    line-height: 32px;
  }
  input:focus {
    outline: none;
  }
</style>
