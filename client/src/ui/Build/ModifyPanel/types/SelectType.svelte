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

<r-select-type>
  <lbl>{(prop.editor && prop.editor.label) || key}:</lbl>

  <!-- https://github.com/rob-balfre/svelte-select -->
  <Select
    isClearable={false}
    items={prop.editor.options}
    selectedValue={getLabelForKey(key)}
    on:select={onSelect}
  />
</r-select-type>

<style>
  r-select-type {
    display: flex;
    align-items: center;

    /* Select box */
    --itemColor: #333;
    --background: none;
    --height: 24px;
  }
  lbl {
    margin-right: 8px;
  }
</style>
