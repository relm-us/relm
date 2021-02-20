<script lang="ts">
  import Button from "../Button";
  import { Relm } from "~/stores/Relm";

  import IoIosSkipForward from "svelte-icons/io/IoIosSkipForward.svelte";

  const step = () => {
    $Relm.step();
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
