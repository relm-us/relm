<script lang="ts">
  import { onMount } from "svelte";
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon, mediaDesired } from "video-mirror";
  // import { videoProducing } from "~/av/stores/producers";
  import { setupState } from "~/stores/setupState";
  import { worldManager } from "~/world";
  import { Identity } from "~/identity/Identity";

  let identity: Identity;

  let muted = false;
  // $: muted = !$videoProducing;

  function toggleMute() {
    if (!$mediaDesired.video) $setupState = "media";
    else {
      muted = !identity.toggleShowVideo();
    }
  }

  onMount(() => {
    return worldManager.meStore.subscribe(($me) => (identity = $me));
  });
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
