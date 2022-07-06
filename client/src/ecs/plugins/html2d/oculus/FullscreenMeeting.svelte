<script lang="ts">
  import { Audio, Video } from "video-mirror";
  import { Readable, get } from "svelte/store";

  import { participantId as localParticipantId } from "~/identity/participantId";
  import { worldManager } from "~/world";

  import Fullscreen from "./Fullscreen.svelte";
  import Presence from "./Presence.svelte";

  export let fullscreenParticipantId: string;
  export let videoTrack = null;
  export let audioTrack = null;
  export let clients: Readable<Set<number>>;

  function getMeAndOtherParticipants(clientIds) {
    const participants = worldManager.participants.getByClientIds(clientIds);

    // Add me so I can see myself
    const me = worldManager.participants.participants.get(localParticipantId);
    participants.push(me);

    // Don't show the "big screen" participant as a little screen also
    const filtered = participants.filter(
      (p) => p.participantId !== fullscreenParticipantId
    );
    return filtered;
  }
</script>

<Fullscreen on:close>
  <r-fullscreen-meeting>
    <Video track={videoTrack} mirror={false} contain={true} />
    <Audio track={audioTrack} />
  </r-fullscreen-meeting>

  <small-pics>
    {#each [...getMeAndOtherParticipants($clients)] as participant}
      <div>
        <Presence
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
