<script lang="ts">
  import ColorPicker from "@budibase/colorpicker";
  import { Color } from "three";

  export let key: string;
  export let component;
  export let prop;

  let value;
  $: {
    const color = new Color(component[key]);
    value = "#" + color.getHexString();
  }

  // ignore warning about missing props
  $$props;
</script>

<style>
  div {
    margin-left: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  lbl {
    padding-right: 8px;
  }
  color {
    padding-left: 8px;
    font-size: 12px;
  }
</style>

<div>
  <lbl>{(prop.editor && prop.editor.label) || key}:</lbl>

  <ColorPicker
    {value}
    disableSwatches={true}
    format="hex"
    open={false}
    width="20px"
    height="20px"
    on:change={({ detail }) => {
      const cssColor = detail.indexOf('#') === 0 ? detail.slice(0, 7) : detail;
      const color = new Color(cssColor);
      const newValue = '#' + color.getHexString();
      component[key] = newValue;
      component.modified();
      console.log('color change', key, component[key], component);
    }} />

  <color>{value}</color>
</div>
