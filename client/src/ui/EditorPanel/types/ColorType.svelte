<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ColorPicker from "@budibase/colorpicker";
  import { Color } from "three";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let value;
  $: {
    const color = new Color(component[key]);
    value = "#" + color.getHexString();
  }

  // ignore warning about missing props
  $$props;
</script>

<div>
  <lbl>{(prop.editor && prop.editor.label) || key}:</lbl>

  <color>
    <color-value>{value}</color-value>
    <ColorPicker
      {value}
      disableSwatches={true}
      open={false}
      width="20px"
      height="20px"
      on:change={({ detail }) => {
        const cssColor =
          detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
        const color = new Color(cssColor);
        const newValue = "#" + color.getHexString();
        component[key] = newValue;
        component.modified();
        dispatch("modified");
      }}
    />
  </color>
</div>

<style>
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 16px;
    margin-right: 16px;
  }
  lbl {
    padding-right: 8px;
  }
  color {
    display: flex;
    align-items: center;
  }
  color-value {
    padding-right: 8px;
    font-family: Consolas, "Liberation Mono", Monaco, "Lucida Console",
      monospace;
    font-size: 12px;
  }
</style>
