<script lang="ts">
  export let key;
  export let component;
  export let prop;

  let value;
  $: value = component[key];
</script>

<r-misc-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div>{JSON.stringify(value)}</div>
</r-misc-type>

<style>
  r-misc-type {
    display: block;
  }
</style>
