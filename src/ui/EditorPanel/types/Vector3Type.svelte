<script lang="ts">
  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  let editing = {
    x: false,
    y: false,
    z: false,
  };

  let value: { x: number; y: number; z: number };
  $: value = component[key];

  function fmt(n) {
    return n === undefined ? "un" : n.toFixed(1);
  }

  const onInputChange = (dimension) => (event) => {
    console.log("onInputChange", event.target.value);
    component[key][dimension] = parseFloat(event.target.value);
    component.modified();
    editing[dimension] = false;
  };

  const onInputCancel = (dimension) => (event) => {
    console.log("onInputCancel");
    editing[dimension] = false;
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => value[dimension],
      onChange: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
      },
      onClick: () => {
        editing[dimension] = true;
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
  {#each ['x', 'y', 'z'] as dim}
    <Capsule
      editing={editing[dim]}
      on:mousedown={draggers[dim].mousedown}
      on:change={onInputChange(dim)}
      on:cancel={onInputCancel(dim)}
      label={dim.toUpperCase()}
      value={fmt(value[dim])} />
  {/each}
</div>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />
