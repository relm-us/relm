<script lang="ts">
  import { worldState } from "~/stores/worldState";
</script>

{#if $worldState === "paused"}
  <message>Paused</message>
{/if}

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
