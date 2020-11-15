<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/world";

  const step = () => {
    worldManager.step();
  };
</script>

<Button on:click={step}>Step</Button>
