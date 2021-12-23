<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/world";

  import IoIosSkipForward from "svelte-icons/io/IoIosSkipForward.svelte";

  const step = () => {
    worldManager.step();
  };
</script>

<Button on:click={step}>
  <icon>
    <IoIosSkipForward />
  </icon>
</Button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
  }
</style>
