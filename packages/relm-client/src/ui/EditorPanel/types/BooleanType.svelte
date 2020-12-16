<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ToggleSwitch from "~/ui/ToggleSwitch";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let value: boolean;
  $: value = component[key];

  const onChange = (event) => {
    component[key] = event.detail;
    component.modified();
    dispatch("modified");
  };
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <ToggleSwitch enabled={value} on:change={onChange} />
</div>
