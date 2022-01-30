<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";

  export let width: number;
  export let height: number;
  export let embedId: string;
  export let title = "YouTube Video";
  export let active = false;

  let src;
  let iframe;
  let state: "INIT" | "LOADING" | "LOADED" = "INIT";
  let frameMouseOver = false;

  const HOST = "https://www.youtube.com";

  $: src = `${HOST}/embed/${embedId}?enablejsapi=1&rel=0&autoplay=1`;

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
      if (data.event === "onReady") {
        state = "LOADED";
      }
    }
  }

  function onFrameLoaded() {
    state = "LOADING";
    const listenEvent = { event: "listening", id: 1, channel: "default" };
    iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");

    const commandEvent = {
      event: "command",
      func: "addEventListener",
      args: ["onReady"],
      id: 1,
      channel: "default",
    };
    iframe.contentWindow.postMessage(JSON.stringify(commandEvent), "*");
  }

  function onPreviewClicked() {
    if ($worldUIMode === "play") {
      active = true;
    }
  }

  // ignore warning about missing props
  $$props;
</script>

<svelte:window on:message={onMessage} on:blur={onWindowBlur} />

{#if active}
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <iframe
    class:invisible={state !== "LOADED"}
    bind:this={iframe}
    on:load={onFrameLoaded}
    on:mouseover={onFrameMouseover}
    on:mouseout={onFrameMouseout}
    {title}
    {width}
    {height}
    {src}
    frameborder="0"
    allowfullscreen
    autoplay={true}
  />

  {#if state !== "LOADED" || $worldUIMode === "build"}
    <overlay>
      {#if state !== "LOADED"}
        <div>Loading...</div>
        {#if state === "INIT"}(1/3){:else if state === "LOADING"}(2/3){/if}
      {/if}
    </overlay>
  {/if}
{:else}
  <image-frame on:click={onPreviewClicked}>
    <img src="https://img.youtube.com/vi/{embedId}/hqdefault.jpg" alt={title} />

    <button aria-label="Play">
      <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
        <path
          class="play-button"
          d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
          fill="#f00"
        />
        <path d="M 45,24 27,14 27,34" fill="#fff" />
      </svg>
    </button>

    <instructions>Load Video</instructions>
  </image-frame>
{/if}

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

  image-frame {
    display: flex;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  image-frame .play-button {
    -webkit-transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    fill: #212121;
    fill-opacity: 0.8;
  }
  image-frame:hover .play-button {
    -webkit-transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    fill: #f00;
    fill-opacity: 1;
  }
  img {
    width: 100%;
    object-fit: cover;
  }

  button {
    border: none;
    background-color: transparent;
    padding: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 68px;
    height: 48px;
    margin-left: -34px;
    margin-top: -24px;
    -webkit-transition: opacity 0.25s cubic-bezier(0, 0, 0.2, 1);
    transition: opacity 0.25s cubic-bezier(0, 0, 0.2, 1);
    z-index: 1;
    cursor: pointer;
  }
  instructions {
    display: block;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 200px;
    margin-left: -100px;
    margin-top: 32px;

    color: white;
    font-size: 32px;
    font-weight: bold;
    text-shadow: 2px 2px 6px black;
    text-align: center;
  }
</style>
