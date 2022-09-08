<script lang="ts">
  import ColorPicker from "~/ui/lib/ColorPicker";
  import { hasAncestor } from "~/utils/hasAncestor";

  export let value;

  let enabled = false;
  let colorPicker;

  function cancelPicker(event) {
    if (!hasAncestor(event.target, colorPicker)) {
      enabled = false;
    }
  }
</script>

<container>
  <ColorPicker
    bind:value
    bind:colorPicker
    bind:open={enabled}
    enableSwatches={true}
    enableAlpha={false}
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
