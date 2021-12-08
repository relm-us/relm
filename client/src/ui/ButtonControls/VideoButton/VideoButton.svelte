<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon, mediaDesired } from "video-mirror";
  // import { videoProducing } from "~/av/stores/producers";
  import { setupState } from "~/stores/setupState";
  import { Relm } from "~/stores/Relm";
  import { Identity } from "~/identity/Identity";

  let identity: Identity;
  $: identity = $Relm && $Relm.identities.me;

  let muted = false;
  // $: muted = !$videoProducing;

  function toggleMute() {
    if (!$mediaDesired.video) $setupState = "media";
    else {
      identity.toggleShowVideo();
    }
  }
</script>

<CircleButton on:click={toggleMute}>
  <icon class:muted>
    <VideoIcon />
  </icon>
</CircleButton>

<style>
  .muted {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>
