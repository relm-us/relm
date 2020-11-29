<script lang="ts">
  import { worldRunning } from "~/stores/worldRunning";
</script>

<style>
  message {
    display: block;

    position: absolute;
    z-index: 3;
    top: 40%;
    left: 50%;
    transform: translate(-50%);

    font-size: 6vw;
    color: white;
  }
</style>

{#if !$worldRunning}
  <message>Paused</message>
{/if}
