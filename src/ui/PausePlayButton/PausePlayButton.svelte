<script lang="ts">
  import Button from "../Button";
  import { worldRunning } from "~/stores/worldRunning";

  const onClick = () => {
    worldRunning.update(($running: boolean) => !$running);
  };
</script>

<Button on:click={onClick}>
  {#if $worldRunning}Pause{:else}Play{/if}
</Button>
