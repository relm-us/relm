<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/world";

  const { running } = worldManager;

  const toggle = () => {
    running.update(($running) => !$running);
  };
</script>

<Button on:click={toggle}>
  {#if $running}Pause{:else}Play{/if}
</Button>
