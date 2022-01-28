<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import MdScreenShare from "svelte-icons/md/MdScreenShare.svelte";
  import { localShareTrackStore } from "~/av/localVisualTrackStore";
  import { localVideoTrack } from "video-mirror";
  import { createScreenTrack } from "~/av/twilio/createScreenTrack";
  import { worldManager } from "~/world";

  let enabled = false;
  $: enabled = Boolean($localShareTrackStore);

  const onClick = async () => {
    if (!enabled) {
      // start screen sharing
      const shareTrack = await createScreenTrack();
      localShareTrackStore.set(shareTrack);

      // TODO: this set-up logic should be somewhere else
      worldManager.participants.setShowVideo(true);
    } else {
      // end screen sharing
      localShareTrackStore.set(null);

      // TODO: this clean-up logic should be somewhere else
      if (!$localVideoTrack) {
        worldManager.participants.setShowVideo(false);
      }
    }
  };
</script>

<r-button class:glowing={enabled}>
  <CircleButton on:click={onClick}>
    <icon>
      <MdScreenShare />
    </icon>
    <slot />
  </CircleButton>
</r-button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

  r-button.glowing {
    border: 3px solid yellow;
    border-radius: 100%;
  }
  r-button.glowing > :global(button) {
    box-shadow: white 0px 0px 15px;
    color: white !important;
  }
</style>
