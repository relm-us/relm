<script lang="ts">
  import { worldManager } from "~/world";

  import Button from "~/ui/lib/Button";

  const onClick = () => {
    worldManager.worldDoc.reapplyWorld();
  };
</script>

<Button on:click={onClick}>Reset Physics</Button>
