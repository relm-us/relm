<script>
  import { onMount } from "svelte";
  import {
    Audio,
    Video,
    AudioIcon,
    AudioLevelIndicator,
    VideoIcon,
  } from "video-mirror";
  import { Relm } from "~/stores/Relm";
  import HtmlOculusMic from "./HtmlOculusMic.svelte";
  import Fullscreen from "./Fullscreen.svelte";
  import shineImg from "./shine.svg";
  import { DistanceRef } from "~/ecs/plugins/distance";

  export let stream;
  export let localStream;
  export let isLocal;
  export let showAudio;
  export let showVideo;
  export let playerId;
  export let entity;

  let fullscreen = false;
  let translucent = false;
  let volume = 0;

  let identity;
  $: identity = $Relm.identities.identities.get(playerId);

  function toggleMute() {
    if (identity && isLocal) {
      identity.toggleShowAudio();
    }
  }

  function toggleVideo() {
    if (identity) {
      if (isLocal) identity.toggleShowVideo();
      else if (showVideo && document.fullscreenEnabled) {
        fullscreen = true;
      }
    }
  }

  function exitFullscreen() {
    fullscreen = false;
  }

  onMount(() => {
    const interval = setInterval(() => {
      const ref = entity.get(DistanceRef);
      if (ref && ref.value !== null) {
        const distance = ref.value;
        if (distance < 3) {
          volume = 1;
          translucent = false;
        } else if (distance < 5) {
          volume = (2 - (distance - 3)) * 0.5;
          translucent = false;
        } else {
          volume = 0;
          translucent = true;
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  });

  // ignore warning about missing props
  $$props;
</script>

{#if $stream}
  <container class:translucent style="--background-image:url({shineImg})">
    <oculus class="round" on:click={toggleVideo}>
      {#if showVideo}
        {#if fullscreen}
          <Fullscreen on:close={exitFullscreen}>
            <Video stream={$stream} mirror={false} class="oculus-video" />
            <picture-in-picture>
              <Video stream={$localStream} mirror={true} class="oculus-video" />
            </picture-in-picture>
          </Fullscreen>
        {:else}
          <Video stream={$stream} mirror={isLocal} class="oculus-video" />
        {/if}
      {:else}
        <icon><VideoIcon /></icon>
      {/if}
      {#if showAudio && !isLocal}
        <Audio stream={$stream} {volume} />
      {/if}
    </oculus>
    {#if !translucent}
      <HtmlOculusMic muted={!showAudio} on:click={toggleMute}>
        {#if showAudio && isLocal}
          <AudioLevelIndicator class="oculus-audio-level-indicator" />
        {/if}
        <AudioIcon enabled={showAudio} class="oculus-audio-icon" />
      </HtmlOculusMic>
    {/if}
  </container>
{/if}

<style lang="scss">
  container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
  container.translucent {
    opacity: 0.4;
  }
  :global(.oculus-audio-level-indicator) {
    width: 24px;
    height: 24px;
  }
  :global(.oculus-audio-icon) {
    position: absolute;
    top: 0;
  }
  :global(.oculus-video) {
    filter: brightness(1.2) saturate(1.1);
  }
  oculus {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    box-shadow: 0 0 5px #cccccc;
    background-color: #959595;

    overflow: hidden;
    border: 2px solid #cccccc;
    border-radius: 100%;

    /* Safari needs this in order to clip the video as a circle */
    transform: translate3d(0, 0, 0);
  }

  icon {
    display: block;
    width: 48px;
    height: 48px;

    box-shadow: 0 0 10px rgba(0, 0, 0, 15%);
    border-radius: 100%;
    padding: 5px;
  }

  @keyframes white {
    from {
      color: #959595;
    }
    to {
      color: white;
    }
  }

  oculus:hover icon {
    animation: both 0.15s white;
  }

  oculus::after {
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    background-image: var(--background-image);
    position: absolute;
    background-size: 100%;
    opacity: 0.45;
  }

  picture-in-picture {
    display: block;
    position: absolute;
    width: 15%;
    height: 15%;
    right: 24px;
    bottom: 24px;
    border: 2px solid white;
  }
</style>
