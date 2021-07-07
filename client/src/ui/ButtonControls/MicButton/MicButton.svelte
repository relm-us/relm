<script>
  import { onMount } from "svelte";
  import CircleButton from "~/ui/lib/CircleButton";
  import { AudioIcon, audioDesired } from "video-mirror";
  import { setupState } from "~/stores/setupState";
  import { Relm } from "~/stores/Relm";

  let muted = false;
  let identity;

  $: identity = $Relm && $Relm.identities.me;

  function toggleMute() {
    if (!$audioDesired) $setupState = "media";
    else identity.toggleShowAudio();
  }

  onMount(() => {
    const interval = setInterval(() => {
      muted = identity && !identity.get("showAudio");
    }, 100);
    return () => {
      clearInterval(interval);
    };
  });

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
