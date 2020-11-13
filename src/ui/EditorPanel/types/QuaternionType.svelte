<script lang="ts">
  import Capsule from "../Capsule.svelte";

  export let key: string;
  export let value: { x: number; y: number; z: number; w: number };
  export let prop;

  function fmt(n) {
    return n === undefined ? "un" : n.toFixed(1);
  }
</script>

<style>
  div {
    margin-left: 16px;
    display: flex;
    flex-wrap: wrap;
  }
</style>

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div>
  <Capsule label="X">{fmt(value.x)}</Capsule>
  <Capsule label="Y">{fmt(value.y)}</Capsule>
  <Capsule label="Z">{fmt(value.z)}</Capsule>
  <Capsule label="W">{fmt(value.w)}</Capsule>
</div>
