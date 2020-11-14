<script lang="ts">
  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  let value: { x: number; y: number; z: number };
  $: value = component[key];

  function fmt(n) {
    return n === undefined ? "un" : n.toFixed(1);
  }

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => value[dimension],
      onChange: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
      },
      onClick: () => {
        console.log("click");
      },
    });
  };

  const draggers = {
    x: makeDragger("x"),
    y: makeDragger("y"),
    z: makeDragger("z"),
  };

  const mousemove = (event) => {
    draggers.x.mousemove(event);
    draggers.y.mousemove(event);
    draggers.z.mousemove(event);
  };
  const mouseup = (event) => {
    draggers.x.mouseup(event);
    draggers.y.mouseup(event);
    draggers.z.mouseup(event);
  };
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
  <Capsule on:mousedown={draggers.x.mousedown} label="X">
    {fmt(value.x)}
  </Capsule>
  <Capsule on:mousedown={draggers.y.mousedown} label="Y">
    {fmt(value.y)}
  </Capsule>
  <Capsule on:mousedown={draggers.z.mousedown} label="Z">
    {fmt(value.z)}
  </Capsule>
</div>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />
