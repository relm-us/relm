<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";

  import IoIosSkipForward from "svelte-icons/io/IoIosSkipForward.svelte";

  const step = () => {
    $worldManager.step();
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
  }
</style>

<Button on:click={step} margin={4}>
  <icon>
    <IoIosSkipForward />
  </icon>
</Button>
