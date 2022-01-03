<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { AudioIcon } from "video-mirror";
  import { worldManager } from "~/world";

  export let enabled = false;

  function toggle() {
    enabled = worldManager.participants.toggleMic();
  }
</script>

<CircleButton on:click={toggle}>
  <icon class:muted={!enabled}>
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
