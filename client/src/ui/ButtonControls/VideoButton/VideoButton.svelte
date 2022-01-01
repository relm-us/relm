<script lang="ts">
  import { onMount } from "svelte";
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon } from "video-mirror";
  import { worldManager } from "~/world";
  import { Identity } from "~/identity/Identity";
  import type { Dispatch } from "~/main/RelmStateAndMessage";

  export let enabled = false;
  export let dispatch: Dispatch;

  let identity: Identity;

  const onClick = () => {
    dispatch({ id: "configureAudioVideo" });
  };

  onMount(() => {
    return worldManager.meStore.subscribe(($me) => (identity = $me));
  });
</script>

<CircleButton on:click={onClick}>
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
