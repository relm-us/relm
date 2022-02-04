<script lang="ts">
  import { onMount } from "svelte";

  import { config } from "~/config";
  import Uppy from "./Uppy.svelte";

  let visible = false;

  export function open() {
    visible = true;
  }

  export function close() {
    visible = false;
  }
</script>

{#if visible}
  <Uppy on:close={close} on:uploaded endpoint={config.serverUploadUrl} />
{/if}
