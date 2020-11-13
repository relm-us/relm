<script lang="ts">
  import Tag from "../Tag.svelte";

  export let key: string;
  export let prop;

  // suppress warning about unknown props
  $$props;
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Tag>[Reference]</Tag>
</div>
