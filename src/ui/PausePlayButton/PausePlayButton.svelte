<script lang="ts">
  import Button from "../Button";
  import { worldRunning } from "~/stores/worldRunning";

  const toggle = () => {
    worldRunning.update(($running: boolean) => !$running);
  };
</script>

<Button on:click={toggle}>
  {#if $worldRunning}Pause{:else}Play{/if}
</Button>
