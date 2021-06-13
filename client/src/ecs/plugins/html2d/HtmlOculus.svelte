<script>
  import { onMount } from "svelte";
  import { Audio, Video, VideoIcon, videoRequested } from "video-mirror";
  import { setupState } from "~/stores/setupState";
  import { Relm } from "~/stores/Relm";
  import Fullscreen from "./Fullscreen.svelte";
  import shineImg from "./shine.svg";

  export let stream;
  export let localStream;
  export let isLocal;
  export let showAudio;
  export let showVideo;
  export let playerId;

  let fullscreen = false;
  let volume = 0;

  let identity;
  $: identity = $Relm.identities.identities.get(playerId);

  function toggleVideo() {
    if (identity) {
      if (isLocal) {
        if (!$videoRequested) $setupState = "media";
        else identity.toggleShowVideo();
      } else if (showVideo) {
        fullscreen = true;
      }
    }
  }

  function exitFullscreen() {
    fullscreen = false;
  }

  onMount(() => {
    if (isLocal) {
      volume = 1;
      return;
    }
    const interval = setInterval(() => {
      const falloffStart = 3;
      const falloffEnd = 6;
      const distance = identity.avatar.distance;
      if (distance >= 0 && distance < falloffStart) {
        volume = 1;
      } else if (distance < falloffEnd) {
        const delta = falloffEnd - falloffStart;
        volume = (delta - (distance - falloffStart)) / delta;
      } else {
        volume = 0;
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  });

  // ignore warning about missing props
  $$props;

</script>

<container
  style="--background-image:url({shineImg}); --oculus-size: {(
    volume * 100
  ).toFixed(3)}%"
>
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
</container>

<style lang="scss">
  container {
    display: block;
    position: relative;
    width: var(--oculus-size, 100%);
    height: var(--oculus-size, 100%);
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
