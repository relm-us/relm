<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ColorPicker from "@budibase/colorpicker";
  import { Color } from "three";

  const dispatch = createEventDispatcher();

  export let value;

  function handlePickColor({ detail }) {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
    const color = new Color(cssColor);
    const newValue = "#" + color.getHexString();
  }

</script>

<ColorPicker
  {value}
  disableSwatches={true}
  open={false}
  width="24px"
  height="24px"
  on:change
/>
