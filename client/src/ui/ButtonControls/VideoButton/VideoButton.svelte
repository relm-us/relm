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

<CircleButton on:click={onClick}>
  <icon class:muted={!enabled}>
    {#if enabled}
      <IconVideoEnabled />
    {:else}
      <IconVideoDisabled />
    {/if}
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
