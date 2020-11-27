<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";
  import { worldRunning } from "~/stores/worldRunning";

  const onClick = () => {
    // worldRunning.set(false);
    $worldManager.wdoc.reapplyWorld();
  };
</script>

<Button on:click={onClick}>Reset World</Button>
