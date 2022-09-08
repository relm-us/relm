<script lang="ts">
  import ColorPicker from "~/ui/lib/ColorPicker";
  import { hasAncestor } from "~/utils/hasAncestor";

  export let value;

  let enabled = false;
  let container;

  function cancelPicker(event) {
    if (!hasAncestor(event.target, container)) {
      enabled = false;
    }
  }
</script>

<container bind:this={container}>
  <ColorPicker
    bind:value
    enableSwatches={true}
    enableAlpha={false}
    bind:open={enabled}
    width="24px"
    height="24px"
    on:change
  />
</container>

<svelte:window on:mousedown={cancelPicker} />

<style>
  container {
    position: relative;
    display: block;
    margin-left: 10px;
    z-index: 100;
  }
</style>
