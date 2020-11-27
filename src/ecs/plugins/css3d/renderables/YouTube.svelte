<script lang="ts">
  export let width: number;
  export let height: number;
  export let embedId: string;
  export let title = "YouTube Video";

  let src;
  let iframe;
  let state: "INIT" | "LOADING" | "LOADED" = "INIT";
  let frameMouseOver = false;

  const HOST = "https://www.youtube.com";

  $: src = `${HOST}/embed/${embedId}?enablejsapi=1&rel=0`;

  // Return keyboard focus to Relm when user clicks on a youtube iframe
  function onWindowBlur() {
    if (frameMouseOver) {
      setTimeout(() => iframe.blur(), 100);
    }
  }

  function onFrameMouseover() {
    frameMouseOver = true;
  }

  function onFrameMouseout() {
    frameMouseOver = false;
  }

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
      channel: "default",
    };
    iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");
  }
</script>

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    pointer-events: auto;
  }
  overlay {
    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    color: black;
    background-color: rgb(240, 240, 240, 0.7);
    box-shadow: inset 0px 0px 0px 6px #000000;
  }
  .invisible {
    visibility: hidden;
  }
</style>

<svelte:window on:message={onMessage} on:blur={onWindowBlur} />

<iframe
  class:invisible={state !== 'LOADED'}
  bind:this={iframe}
  on:load={onFrameLoaded}
  on:mouseover={onFrameMouseover}
  on:mouseout={onFrameMouseout}
  {title}
  {width}
  {height}
  {src}
  frameborder="0"
  allowfullscreen />

<overlay>
  {#if state !== 'LOADED'}
    <div>Loading...</div>
    {#if state === 'INIT'}(1/3){:else if state === 'LOADING'}(2/3){/if}
  {/if}
</overlay>
