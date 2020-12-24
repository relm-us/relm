<script lang="ts">
  import { get } from "svelte/store";
  import { config } from "~/stores/config";
  import Uppy from "~/ui/Uploader/Uppy.svelte";

  let visible = true;

  function toggleVisibility() {
    visible = !visible;
    console.log("toggleVisibility", visible);
  }
  // get(config).serverUploadUrl
</script>

<button on:click={toggleVisibility}>Dropzone</button>
{#if visible}
  <Uppy on:close={toggleVisibility} />
{/if}

<div>Hello, this goes here on the page</div>
