<script lang="ts">
  import type AvSettingsButton from "./AVSettingsButton.svelte";

  import CircleButton from "~/ui/lib/CircleButton";
  import { IconVideoEnabled, IconVideoDisabled } from "~/av/icons";
  import { localVideoTrack } from "~/av/VideoMirror";
  import { worldManager } from "~/world";

  export let enabled = false;
  export let avSettingsButton: AvSettingsButton = null;

  function toggle() {
    if ($localVideoTrack) {
      enabled = worldManager.participants.toggleVideo();
    } else {
      avSettingsButton?.drawAttention();
    }
  }
</script>

<div class:muted={!enabled}>
  <CircleButton
    on:click={toggle}
    Icon={enabled ? IconVideoEnabled : IconVideoDisabled}
  />
</div>

<style>
  .muted :global(icon) {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
</style>
