<script lang="ts">
  import { Audio, Video } from "video-mirror";
  import { Readable, get } from "svelte/store";

  import { worldManager } from "~/world";
  import { audioMode } from "~/stores/audioMode";
  import Fullscreen from "./Fullscreen.svelte";
  import shineImg from "./shine.svg";
  import { participantId as localParticipantId } from "~/identity/participantId";
  import { localShareTrackStore } from "~/av/localVisualTrackStore";
  import {
    PROXIMITY_AUDIO_INNER_RADIUS,
    PROXIMITY_AUDIO_OUTER_RADIUS,
  } from "~/config/constants";
  import NameTag from "./NameTag.svelte";
  import { Entity } from "~/ecs/base";
  import { worldUIMode } from "~/stores";

  export let participantName: string;
  export let color: string;
  export let showAudio: boolean;
  export let showVideo: boolean;
  export let participantId: string;
  export let clients: Readable<Set<number>>;
  export let entity: Entity;

  let fullscreen = false;
  // TODO: add `size` var instead of hardcoding volume to be size
  let volume = 1;

  let isLocalSharing = false;
  $: isLocalSharing = Boolean($localShareTrackStore);

  let isLocal;
  $: isLocal = participantId === localParticipantId;

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
    localParticipantId,
    "video"
  );

  // TODO: (privacy) Make it so full screen is only possible when remote is sharing screen
  function enterFullscreen() {
    if (!isLocal) {
      fullscreen = true;
      worldManager.setFps(1);
    }
  }

  function exitFullscreen() {
    if (!isLocal) {
      fullscreen = false;
      worldManager.setFps(60);
    }
  }

  function getMeAndOtherParticipants(clientIds) {
    const participants = worldManager.participants.getByClientIds(clientIds);

    // Add me so I can see myself
    const me = worldManager.participants.participants.get(localParticipantId);
    participants.push(me);

    // Don't show the "big screen" participant as a little screen also
    const filtered = participants.filter(
      (p) => p.participantId !== participantId
    );
    return filtered;
  }

  let interval;
  $: if ($audioMode === "proximity" && !isLocal) {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (!participant || !participant.avatar) return;

      const falloffStart = PROXIMITY_AUDIO_INNER_RADIUS;
      const falloffEnd = PROXIMITY_AUDIO_OUTER_RADIUS;
      const distance =
        participant.avatar.entities.body.getByName("DistanceRef").value;
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
    <oculus
      class="round"
      class:contain={fullscreen}
      style="--oculus-border-color: {color}"
      on:click={enterFullscreen}
    >
      {#if fullscreen}
        <Fullscreen on:close={exitFullscreen}>
          <Video track={$videoStore} mirror={false} contain={true} />

          <small-pics>
            {#each [...getMeAndOtherParticipants($clients)] as participant}
              <div>
                <oculus
                  class="round"
                  style="--oculus-border-color: {participant.identityData
                    .color}"
                >
                  <Video
                    track={get(
                      worldManager.avConnection.getTrackStore(
                        participant.participantId,
                        "video"
                      )
                    )}
                    mirror={participant.participantId === localParticipantId}
                  />
                </oculus>
                <NameTag
                  name={participant.identityData.name}
                  editable={false}
                  color={participant.identityData.color}
                />
              </div>
            {/each}
          </small-pics>
        </Fullscreen>
      {:else}
        <Video track={$videoStore} mirror={isLocal && !isLocalSharing} />
      {/if}
    </oculus>
    <NameTag
      name={participantName}
      editable={isLocal && $worldUIMode !== "build"}
      {color}
      {entity}
    />
  </container>
{:else}
  <!-- Just show name -->
  <NameTag
    name={participantName}
    editable={isLocal && $worldUIMode !== "build"}
    {color}
    {entity}
  />
{/if}

{#if showAudio && !isLocal}
  <Audio track={$audioStore} {volume} />
{/if}

<style>
  container {
    display: block;
    position: relative;
    width: var(--oculus-size, 100%);
    height: var(--oculus-size, 100%);
    pointer-events: auto;
  }

  oculus {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    box-shadow: 0 0 5px var(--oculus-border-color, #cccccc);
    background-color: #959595;

    overflow: hidden;
    border: 2px solid var(--oculus-border-color, #cccccc);
    border-radius: 100%;

    /* Safari needs this in order to clip the video as a circle */
    transform: translate3d(-2px, 0, 0);
  }

  .contain :global(video) {
    object-fit: contain;
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

  small-pics {
    display: flex;
    position: absolute;
    height: 100px;
    left: 24px;
    right: 24px;
    bottom: 24px;
  }

  small-pics div {
    margin: 5px 15px;
    width: 100px;
    height: 100px;
    position: relative;
  }
</style>
