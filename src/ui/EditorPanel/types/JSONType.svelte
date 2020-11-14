<script lang="ts">
  export let key;
  export let component;
  export let prop;

  let value;
  $: value = component[key];
</script>

<style>
  div {
    margin-left: 16px;
    overflow-wrap: anywhere;
  }
  pre {
    margin: 0;
  }
  .fixed-width {
    font-family: monospace;
  }
</style>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div class="fixed-width">
  <pre>{JSON.stringify(value, null, 2)}</pre>
</div>
