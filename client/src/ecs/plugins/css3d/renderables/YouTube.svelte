<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";
  import { isFirefox } from "~/utils/isFirefox";

  import PlayButtonIcon from "./shared/PlayButtonIcon.svelte";

  export let width: number;
  export let height: number;
  export let embedId: string;
  export let alwaysOn: boolean;
  export let title = "YouTube Video";

  let src;
  let iframe;
  let state: "INIT" | "LOADING" | "LOADED" = "INIT";
  let frameMouseOver = false;
  let active = false;
  let overlayHovered = false;

  const UNSTARTED = -1;
  const ENDED = 0;
  const PLAYING = 1;
  const PAUSED = 2;
  const BUFFERING = 3;
  const VIDEO_CUED = 5;
  let playerState = UNSTARTED;

  let useAltControls = isFirefox();

  const HOST = "https://www.youtube.com";

  /**
   * Note: Firefox currently has a bug where it distorts pointer event coordinates
   *       within CSS3D transformed iframes. As a result, we must disable the
   *       YouTube controls for Firefox (as of FF 96.0).
   */
  $: src = `${HOST}/embed/${embedId}?enablejsapi=1&rel=0&controls=${
    useAltControls ? 0 : 1
  }`;

  $: if (alwaysOn) {
    active = true;
  }

  $: console.log("playerState", playerState);

  function ytCommand(func, args = []) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        id: 1,
        channel: "default",
        func,
        args,
      }),
      "*"
    );
  }

  function playVideo() {
    console.log("playVideo");
    ytCommand("playVideo");
    // TODO: check if we've been granted autoplay
    // ytCommand("unMute");
  }

  function pauseVideo() {
    ytCommand("pauseVideo");
  }

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
      // console.log("yt data", data);
      if (data.info && "playerState" in data.info) {
        playerState = data.info.playerState;
      }
      if (data.event === "onReady") {
        state = "LOADED";

        if (!alwaysOn) {
          playVideo();
        }
      }
    }
  }

  function onFrameLoaded() {
    state = "LOADING";
    const listenEvent = { event: "listening", id: 1, channel: "default" };
    iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");

    ytCommand("addEventListener", ["onReady"]);
    // ytCommand("mute");
  }

  function onClickPlay() {
    if ($worldUIMode === "play") {
      if (playerState === PLAYING) {
        pauseVideo();
      } else {
        if (alwaysOn || active) playVideo();
        else active = true;
      }
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
    allow="autoplay"
  />

  {#if state !== "LOADED" || $worldUIMode === "build"}
    <r-overlay>
      {#if state !== "LOADED"}
        <r-centered>
          <div>Loading...</div>
        </r-centered>
      {/if}
    </r-overlay>
  {:else if useAltControls}
    <r-overlay
      on:click={onClickPlay}
      on:pointerenter={() => (overlayHovered = true)}
      on:pointerleave={() => (overlayHovered = false)}
    >
      {#if overlayHovered}
        <PlayButtonIcon active={overlayHovered} />
      {/if}
    </r-overlay>
  {/if}
{:else}
  <r-overlay
    on:click={onClickPlay}
    on:pointerenter={() => (overlayHovered = true)}
    on:pointerleave={() => (overlayHovered = false)}
  >
    <img src="https://img.youtube.com/vi/{embedId}/hqdefault.jpg" alt={title} />

    <PlayButtonIcon active={overlayHovered} />
  </r-overlay>
{/if}

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    pointer-events: auto;
  }

  r-overlay {
    display: flex;

    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
  }

  r-centered {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    color: black;
    background-color: rgb(240, 240, 240, 0.7);

    font-size: 32px;
    font-weight: bold;
    /* box-shadow: inset 0px 0px 0px 6px #000000; */
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
  /* image-frame :global(path) {
    -webkit-transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    fill: #212121;
    fill-opacity: 0.8;
  }
  image-frame:hover :global(path) {
    -webkit-transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    fill: #f00;
    fill-opacity: 1;
  } */
  img {
    width: 100%;
    object-fit: cover;
  }
</style>
