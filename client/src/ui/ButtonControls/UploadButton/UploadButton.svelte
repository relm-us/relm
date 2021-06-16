<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoIosCloudUpload from "svelte-icons/io/IoIosCloudUpload.svelte";

  import Uploader from "./Uploader";

  let uploader;

  const onClick = () => {
    uploader.open();
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

<CircleButton on:click={onClick}>
  <icon>
    <IoIosCloudUpload />
  </icon>
  <slot />
</CircleButton>

<Uploader on:uploaded bind:this={uploader} />
