<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";

  const step = () => {
    $worldManager.step();
  };
</script>

<Button on:click={step}>Step</Button>
