<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { AudioIcon, mediaDesired } from "video-mirror";
  import { audioProducing } from "~/av/stores/producers";
  import { setupState } from "~/stores/setupState";
  import { Relm } from "~/stores/Relm";
  import { Identity } from "~/identity/Identity";

  let identity: Identity;
  $: identity = $Relm && $Relm.identities.me;

  let muted = false;
  $: muted = !$audioProducing;

  function toggleMute() {
    if (!$mediaDesired.audio) $setupState = "media";
    else {
      muted = !identity.toggleShowAudio();
    }
  }
</script>

<CircleButton on:click={toggleMute}>
  <icon class:muted>
    <AudioIcon />
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
