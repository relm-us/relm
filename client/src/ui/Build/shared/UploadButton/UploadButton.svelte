<script lang="ts">
  import IoIosCloudUpload from "svelte-icons/io/IoIosCloudUpload.svelte";

  import Button from "~/ui/lib/Button";
  import Uploader from "./Uploader";

  let uploader;

  const onClick = () => {
    uploader.open();
  };
</script>

<Button on:click={onClick}  >
  <r-compound>
    <icon><IoIosCloudUpload /></icon>
    <div>Upload</div>
  </r-compound>
</Button>

<Uploader on:uploaded bind:this={uploader} />

<style>
  icon {
    display: block;
    width: 24px;
    height: 24px;
    margin: 0 8px 0 0;
  }

  r-compound {
    display: flex;
    align-items: center;
    margin: 0 12px 0 8px;
  }
</style>
