<script lang="ts">
  import { get } from "svelte/store";
  import { config } from "~/stores/config";
  import Dropzone from "~/ui/Uploader/Dropzone.svelte";

  let showDropzone = true;

  let dropzone;
</script>

<button on:click={dropzone.showSelectFileDialog}>Dropzone</button>
{#if showDropzone}
  <Dropzone bind:this={dropzone} uploadUrl={get(config).serverUploadUrl} />
{/if}

<div>Hello, this goes here on the page</div>
