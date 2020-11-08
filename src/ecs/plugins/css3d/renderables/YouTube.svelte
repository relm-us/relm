<script lang="ts">
  import { onMount } from "svelte";
  import { init } from "svelte/internal";

  export let width: number;
  export let height: number;
  export let embedId: string;
  export let title = "YouTube Video";

  let src;
  let iframe;
  let state: "INIT" | "LOADING" | "LOADED" = "INIT";

  const HOST = "https://www.youtube.com";

  $: src = `${HOST}/embed/${embedId}?enablejsapi=1&rel=0`;

  function onMessage(message) {
    if (message.origin === HOST) {
      const data = JSON.parse(message.data);
      if (data.event == "onReady") {
        state = "LOADED";
      }
    }
  }

  function onFrameLoaded(event) {
    state = "LOADING";
    const listenEvent = { event: "listening", id: 1, channel: "test" };
    iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");

    const commandEvent = {
      event: "command",
      func: "addEventListener",
      args: ["onReady"],
      id: 1,
      channel: "test",
    };
    iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");
  }

  onMount(() => {
    console.log("src", src);
    console.log("iframe.contentWindow", iframe.contentWindow);
  });
</script>

<style>
  iframe {
    pointer-events: auto;
    z-index: 1;
    position: absolute;
  }
  overlay {
    z-index: 2;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .invisible {
    visibility: hidden;
  }
</style>

<svelte:window on:message={onMessage} />

<iframe
  class:invisible={state !== 'LOADED'}
  bind:this={iframe}
  on:load={onFrameLoaded}
  {title}
  {width}
  {height}
  {src}
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowfullscreen />

{#if state !== 'LOADED'}
  <overlay>
    <div>Loading...</div>
    {#if state === 'INIT'}(1/3){:else if state === 'LOADING'}(2/3){/if}
  </overlay>
{/if}
