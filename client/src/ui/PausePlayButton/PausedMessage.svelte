<script lang="ts">
  import { playState } from "~/stores/playState";
</script>

{#if $playState === "paused"}
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
