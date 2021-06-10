<script lang="ts">
  import ColorPicker from "@budibase/colorpicker";
  export let value;

</script>

<container>
<ColorPicker
  bind:value
  disableSwatches={true}
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
