<script lang="ts">
  import ColorPicker from "~/ui/lib/ColorPicker";
  export let value;

</script>

<container>
<ColorPicker
  bind:value
  enableSwatches={true}
  enableAlpha={false}
  open={false}
  width="24px"
  height="24px"
  on:change
/>
</container>

<style>
  container {
    display: block;
    margin-left: 10px;
  }
</style>
