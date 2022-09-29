<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { IconVideoEnabled, IconVideoDisabled } from "video-mirror";
  import type { Dispatch } from "~/main/ProgramTypes";

  export let enabled = false;
  export let dispatch: Dispatch;

  const onClick = () => {
    dispatch({ id: "setUpAudioVideo" });
  };
</script>

<div class:muted={!enabled}>
  <CircleButton
    on:click={onClick}
    Icon={enabled ? IconVideoEnabled : IconVideoDisabled}
  />
</div>

<style>
  .muted :global(icon) {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
</style>
