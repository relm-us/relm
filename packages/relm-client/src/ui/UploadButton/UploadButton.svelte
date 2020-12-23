<script lang="ts">
  import Button from "../Button";
  import IoIosCloudUpload from "svelte-icons/io/IoIosCloudUpload.svelte";

  import Uploader from "../Uploader";

  let visible = false;

  const onClick = () => {
    visible = !visible;
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
  dialog {
    display: flex;
    flex-direction: column;
  }
</style>

<Button on:click={onClick}>
  <icon>
    <IoIosCloudUpload />
  </icon>
</Button>

{#if visible}
  <dialog>
    <Uploader />
  </dialog>
{/if}
