<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon } from "video-mirror";
  import type { Dispatch } from "~/main/RelmStateAndMessage";

  export let enabled = false;
  export let dispatch: Dispatch;

  const onClick = () => {
    dispatch({ id: "configureAudioVideo" });
  };
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
