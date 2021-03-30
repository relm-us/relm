<script>
  import { Audio, Video, AudioIcon, AudioLevelIndicator } from "video-mirror";
  import { Relm } from "~/stores/Relm";
  import HtmlOculusMic from "./HtmlOculusMic.svelte";

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
  <container>
    <oculus class="round" on:click={toggleVideo}>
      {#if showVideo}
        <Video stream={$stream} mirror={isLocal} />
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
</style>
