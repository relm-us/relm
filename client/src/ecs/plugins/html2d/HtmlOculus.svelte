<script>
  import { Audio, Video } from "video-mirror";
  import { worldManager } from "~/world";
  import { audioMode } from "~/stores/audioMode";
  import Fullscreen from "./Fullscreen.svelte";
  import shineImg from "./shine.svg";
  import { playerId as localPlayerId } from "~/identity/playerId";
  import { localShareTrackStore } from "~/av/localVisualTrackStore";

  export let showAudio;
  export let showVideo;
  export let participantId;

  let fullscreen = false;
  // TODO: add `size` var instead of hardcoding volume to be size
  let volume = 1;

  let isLocalSharing = false;
  $: isLocalSharing = Boolean($localShareTrackStore);

  let isLocal;
  $: isLocal = participantId === localPlayerId;

  let participant;
  $: participant = worldManager.participants.participants.get(participantId);

  let videoStore;
  $: videoStore = worldManager.avConnection.getTrackStore(
    participantId,
    "video"
  );

  let audioStore;
  $: audioStore = worldManager.avConnection.getTrackStore(
    participantId,
    "audio"
  );

  let localVideoStore;
  $: localVideoStore = worldManager.avConnection.getTrackStore(
    localPlayerId,
    "video"
  );

  // TODO: (privacy) Make it so full screen is only possible when remote is sharing screen
  function enterFullscreen() {
    fullscreen = true;
  }

  function exitFullscreen() {
    fullscreen = false;
  }

  let interval;
  $: if ($audioMode === "proximity" && !isLocal) {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      const falloffStart = 3;
      const falloffEnd = 6;
      const distance = participant.avatar.distance;
      if (distance >= 0 && distance < falloffStart) {
        volume = 1;
      } else if (distance < falloffEnd) {
        const delta = falloffEnd - falloffStart;
        volume = (delta - (distance - falloffStart)) / delta;
      } else {
        volume = 0;
      }
    }, 100);
  } else if (interval) {
    clearInterval(interval);
    volume = 1;
  }

  // ignore warning about missing props
  $$props;
</script>

{#if showVideo}
  <container
    style="--background-image:url({shineImg}); --oculus-size: {(
      volume * 100
    ).toFixed(3)}%"
  >
    <oculus class="round" on:click={enterFullscreen}>
      {#if fullscreen}
        <Fullscreen on:close={exitFullscreen}>
          <Video track={$videoStore} mirror={false} class="oculus-video" />
          <picture-in-picture>
            <Video
              track={$localVideoStore}
              mirror={true}
              class="oculus-video"
            />
          </picture-in-picture>
        </Fullscreen>
      {:else}
        <Video
          track={$videoStore}
          mirror={isLocal && !isLocalSharing}
          class="oculus-video"
        />
      {/if}
      {#if showAudio && !isLocal}
        <Audio track={$audioStore} {volume} />
      {/if}
    </oculus>
  </container>
{/if}

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

  @keyframes white {
    from {
      color: #959595;
    }
    to {
      color: white;
    }
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
