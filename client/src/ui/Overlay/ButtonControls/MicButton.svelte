<script lang="ts">
  import type AvSettingsButton from "./AVSettingsButton.svelte";

  import CircleButton from "~/ui/lib/CircleButton";
  import {
    IconAudioEnabled,
    IconAudioDisabled,
    localAudioTrack,
  } from "video-mirror";
  import { worldManager } from "~/world";

  export let enabled = false;
  export let avSettingsButton: AvSettingsButton = null;

  function toggle() {
    if ($localAudioTrack) {
      enabled = worldManager.participants.toggleMic();
    } else {
      avSettingsButton?.drawAttention();
    }
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
