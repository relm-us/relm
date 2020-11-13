<script lang="ts">
  import Tag from "../Tag.svelte";

  export let key: string;
  export let value: number;
  export let prop;

  function fmt(n) {
    if (typeof n === "string") {
      return n;
    } else if (typeof n === "number") {
      return n.toFixed(4);
    } else if (n === undefined) {
      return "[undefined]";
    } else {
      console.log("unknown type of NumberType", n);
      return "[unknown]";
    }
  }
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Tag>{fmt(value)}</Tag>
</div>
