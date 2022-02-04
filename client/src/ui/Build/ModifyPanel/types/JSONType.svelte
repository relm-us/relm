<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { parse } from "~/utils/parse";

  export let key;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let value;
  $: value = component[key];

  const handleChange = (event) => {
    let parsed = parse(event.target.value);
    if (parsed) {
      component[key] = parsed;
      component.modified();
      dispatch("modified");
    }
  };
</script>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div class="fixed-width">
  <textarea spellcheck="false" on:change={handleChange}>{JSON.stringify(value)}</textarea>
</div>

<style>
  div {
    margin-left: 16px;
    overflow-wrap: anywhere;
  }
  textarea {
    width: 228px;
    margin: 8px 0;
  }
  .fixed-width {
    font-family: monospace;
  }
</style>
