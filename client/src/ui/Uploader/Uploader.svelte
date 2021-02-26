<script lang="ts">
  import { get } from "svelte/store";
  import { config } from "~/config";
  import Uppy from "~/ui/Uploader/Uppy.svelte";

  let visible = false;

  export function open() {
    visible = true;
  }

  export function close() {
    visible = false;
  }
</script>

{#if visible}
  <Uppy on:close={close} on:uploaded endpoint={get(config).serverUploadUrl} />
{/if}
