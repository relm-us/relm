<script lang="ts">
  import Button from "~/ui/Button";
  import MdScreenShare from "svelte-icons/md/MdScreenShare.svelte";
  import { Relm } from "~/stores/Relm";

  const onClick = () => {
    $Relm.roomClient.enableShare();
  };

</script>

<Button on:click={onClick}>
  <icon>
    <MdScreenShare />
  </icon>
  <slot />
</Button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

</style>
