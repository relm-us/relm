<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import MdScreenShare from "svelte-icons/md/MdScreenShare.svelte";
  import { Relm } from "~/stores/Relm";

  const onClick = () => {
    $Relm.roomClient.enableShare();
  };

</script>

<CircleButton on:click={onClick}>
  <icon>
    <MdScreenShare />
  </icon>
  <slot />
</CircleButton>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

</style>
