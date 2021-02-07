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
  }
</style>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div>{JSON.stringify(value)}</div>
