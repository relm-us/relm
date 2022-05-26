<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { IconAudioEnabled, IconAudioDisabled } from "video-mirror";
  import { worldManager } from "~/world";

  export let enabled = false;

  function toggle() {
    enabled = worldManager.participants.toggleMic();
  }
</script>

<div class:muted={!enabled}>
  <CircleButton
    on:click={toggle}
    Icon={enabled ? IconAudioEnabled : IconAudioDisabled}
  />
</div>

<style>
  .muted :global(icon) {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
</style>
