<script lang="ts">
  /**
   * IndividualContainer: The highest-level svelte component for audio/video. Manages switching to/from fullscreen mode.
   */

  import type { Readable } from "svelte/store";

  import type { Participant } from "~/types";
  import type { Cut } from "./types";

  import { worldManager } from "~/world";
  import { participantId as localParticipantId } from "~/identity/participantId";
  import { localShareTrackStore } from "~/av/localVisualTrackStore";
  import {
    PROXIMITY_AUDIO_INNER_RADIUS,
    PROXIMITY_AUDIO_OUTER_RADIUS,
  } from "~/config/constants";
  import { worldUIMode } from "~/stores";
  import { audioMode } from "~/stores/audioMode";
  import { fullscreenMeeting } from "~/stores/fullscreenMeeting";

  import { Entity } from "~/ecs/base";
  import { Oculus } from "../components";

  import Individual from "./Individual.svelte";
  import FullscreenMeeting from "./FullscreenMeeting.svelte";

  export let participantName: string;
  export let color: string;
  export let showAudio: boolean;
  export let showVideo: boolean;
  export let participantId: string;
  export let participants: Readable<Participant[]>;
  export let entity: Entity;

  export let diameter: number = null;
  export let cuts: Cut[] = null;

  let volume = 1;
  let fullscreen = false;

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

  // TODO: (privacy) Make it so full screen is only possible when remote is sharing screen
  function enterFullscreen() {
    if (!isLocal) {
      fullscreen = $fullscreenMeeting = true;
      // TODO: implement 'lockFps' so framerate does not revert automatically to 20 fps or so
      worldManager.setFps(1);
    }
  }

  function exitFullscreen() {
    if (!isLocal) {
      fullscreen = $fullscreenMeeting = false;
      worldManager.setFps(60);
    }
  }

  function onChangeName({ detail }) {
    const oculus: Oculus = entity.get(Oculus);
    oculus.name = detail.name;

    if (oculus.onChange) oculus.onChange(detail.name);
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

{#if fullscreen}
  <FullscreenMeeting
    {participants}
    fullscreenParticipantId={participantId}
    videoTrack={showVideo && $videoStore}
    audioTrack={showAudio && !isLocal && $audioStore}
    on:close={exitFullscreen}
  />
{:else if !$fullscreenMeeting}
  <Individual
    {color}
    name={participantName}
    on:change={onChangeName}
    on:click={!isLocal && enterFullscreen}
    mirror={isLocal && !isLocalSharing}
    editable={isLocal && $worldUIMode !== "build"}
    videoTrack={showVideo && $videoStore}
    audioTrack={showAudio && !isLocal && $audioStore}
    {volume}
    diameter={diameter * volume}
    {cuts}
  />
{/if}
