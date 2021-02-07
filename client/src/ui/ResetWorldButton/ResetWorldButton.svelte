<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";

  const onClick = () => {
    $worldManager.wdoc.reapplyWorld();
  };
</script>

<Button on:click={onClick}>Reset Physics</Button>
