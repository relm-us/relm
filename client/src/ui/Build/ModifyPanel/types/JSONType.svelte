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

  // ignore warning about missing props
  $$props;
</script>

<r-json-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="fixed-width">
    <textarea spellcheck="false" on:change={handleChange}
      >{JSON.stringify(value)}</textarea
    >
  </div>
</r-json-type>

<style>
  r-json-type {
    display: block;
  }
  textarea {
    width: calc(100% - 8px);
    margin: 8px 0;
    overflow-wrap: anywhere;
    resize: vertical;
  }
  .fixed-width {
    font-family: monospace;
  }
</style>
