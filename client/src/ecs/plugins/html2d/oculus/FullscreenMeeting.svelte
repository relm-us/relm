<script lang="ts">
import type { Participant, ParticipantMap } from "~/types"

import Audio from "~/av/components/Audio"
import Video from "~/av/components/Video"
import { Readable, get } from "svelte/store"

import { participantId as localParticipantId } from "~/identity/participantId"
import { worldManager } from "~/world"

import Fullscreen from "./Fullscreen.svelte"
import Individual from "./Individual.svelte"
import { derived } from "svelte/store"

export let fullscreenParticipantId: string
export let videoTrack = null
export let audioTrack = null
export let participants: Readable<ParticipantMap>

const smallParticipants: Readable<Participant[]> = derived([participants], ([$participants], set) => {
  set(Array.from($participants.values()).filter((p) => p.participantId !== fullscreenParticipantId))
})
</script>

<Fullscreen on:close>
  <r-fullscreen-meeting>
    <Video track={videoTrack} mirror={false} contain={true} />
    <Audio track={audioTrack} />
  </r-fullscreen-meeting>

  <small-pics>
    {#each $smallParticipants as participant}
      <div>
        <Individual
          diameter={100}
          color={participant.identityData.color}
          name={participant.identityData.name}
          mirror={participant.participantId === localParticipantId}
          audioTrack={participant.participantId !== localParticipantId &&
            get(
              worldManager.avConnection.getTrackStore(
                participant.participantId,
                "audio"
              )
            )}
          videoTrack={get(
            worldManager.avConnection.getTrackStore(
              participant.participantId,
              "video"
            )
          )}
        />
      </div>
    {/each}
  </small-pics>
</Fullscreen>

<style>
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

  r-fullscreen-meeting {
    display: block;
    width: 100%;
    height: 100%;
  }

  r-fullscreen-meeting :global(video) {
    object-fit: contain;
  }
</style>
