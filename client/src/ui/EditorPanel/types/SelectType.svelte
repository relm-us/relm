<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  function onSelect(event) {
    const value = event.detail.value;
    if (component[key] !== value) {
      component[key] = value;
      component.modified();
      dispatch("modified");
    }
  }

  function getLabelForKey(key) {
    return prop.editor.options.find((item) => item.value === component[key]);
  }
</script>

<div>
  <lbl>{(prop.editor && prop.editor.label) || key}:</lbl>

  <!-- https://github.com/rob-balfre/svelte-select -->
  <Select
    isClearable={false}
    items={prop.editor.options}
    selectedValue={getLabelForKey(key)}
    on:select={onSelect}
  />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    margin: 8px 0px 6px 16px;

    /* Select box */
    --itemColor: #333;
    --background: none;
    --height: 24px;
  }
  lbl {
    margin-right: 8px;
  }
</style>
