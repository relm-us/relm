<script lang="ts">
  import Tag from "../Tag.svelte";

  export let key: string;
  export let component;
  export let prop;

  let value: string;
  $: value = component[key].url;
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Tag>{value}</Tag>
</div>
