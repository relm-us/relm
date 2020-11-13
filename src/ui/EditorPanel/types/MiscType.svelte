<script lang="ts">
  export let key;
  export let value;
  export let prop;
</script>

<style>
  div {
    margin-left: 16px;
  }
</style>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div>{JSON.stringify(value)}</div>
