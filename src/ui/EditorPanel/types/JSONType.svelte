<script lang="ts">
  export let key;
  export let value;
  export let prop;
</script>

<style>
  div {
    margin-left: 16px;
    overflow-wrap: anywhere;
  }
  .fixed-width {
    font-family: monospace;
  }
</style>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div class="fixed-width">
  <pre>{JSON.stringify(value, null, 2)}</pre>
</div>
