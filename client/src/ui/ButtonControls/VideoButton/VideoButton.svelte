<script lang="ts">
  import { onMount } from "svelte";
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon } from "video-mirror";
  import { worldManager } from "~/world";
  import { Identity } from "~/identity/Identity";

  let identity: Identity;

  export let enabled = false;

  function toggle() {
    enabled = identity.toggleShowVideo();
  }

  onMount(() => {
    return worldManager.meStore.subscribe(($me) => (identity = $me));
  });
</script>

<CircleButton on:click={toggle}>
  <icon class:muted={!enabled}>
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
