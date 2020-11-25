<script lang="ts">
  import { MathUtils } from "three";

  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  let editing = {
    x: false,
    y: false,
    z: false,
    w: false,
  };

  let value: { x: number; y: number; z: number; w: number };
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
        const value = MathUtils.clamp(newValue, -1, 1);
        if (component[key][dimension] !== value) {
          component[key][dimension] = value;
          component[key].normalize();
          component.modified();
        }
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
    w: makeDragger("w"),
  };

  const mousemove = (event) => {
    draggers.x.mousemove(event);
    draggers.y.mousemove(event);
    draggers.z.mousemove(event);
    draggers.w.mousemove(event);
  };
  const mouseup = (event) => {
    draggers.x.mouseup(event);
    draggers.y.mouseup(event);
    draggers.z.mouseup(event);
    draggers.w.mouseup(event);
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
  {#each ['x', 'y', 'z', 'w'] as dim}
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
