<script lang="ts">
  import Button from "../Button";
  import IoIosCloudUpload from "svelte-icons/io/IoIosCloudUpload.svelte";

  import Uploader from "../Uploader";

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

<Button on:click={onClick}>
  <icon>
    <IoIosCloudUpload />
  </icon>
  <slot />
</Button>

<Uploader on:uploaded bind:this={uploader} />
