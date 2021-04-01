<script>
  import {
    Audio,
    Video,
    AudioIcon,
    AudioLevelIndicator,
    VideoIcon,
  } from "video-mirror";
  import { Relm } from "~/stores/Relm";
  import HtmlOculusMic from "./HtmlOculusMic.svelte";
  import shineImg from "./shine.svg";

  export let stream;
  export let isLocal;
  export let showAudio;
  export let showVideo;
  export let playerId;

  let identity;
  $: identity = $Relm.identities.identities.get(playerId);

  function toggleMute() {
    if (identity && isLocal) {
      identity.toggleShowAudio();
    }
  }

  function toggleVideo() {
    if (identity && isLocal) {
      identity.toggleShowVideo();
    }
  }

  // ignore warning about missing props
  $$props;
</script>

{#if $stream}
  <container style="--background-image:url({shineImg})">
    <oculus class="round" on:click={toggleVideo}>
      {#if showVideo}
        <Video stream={$stream} mirror={isLocal} class="oculus-video" />
      {:else}
        <icon><VideoIcon /></icon>
      {/if}
      {#if showAudio && !isLocal}
        <Audio stream={$stream} />
      {/if}
    </oculus>
    <HtmlOculusMic muted={!showAudio} on:click={toggleMute}>
      {#if showAudio && isLocal}
        <AudioLevelIndicator class="oculus-audio-level-indicator" />
      {/if}
      <AudioIcon enabled={showAudio} class="oculus-audio-icon" />
    </HtmlOculusMic>
  </container>
{/if}

<style lang="scss">
  container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
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
</style>
