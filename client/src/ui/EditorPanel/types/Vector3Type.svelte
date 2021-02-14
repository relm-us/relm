<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = {
    x: false,
    y: false,
    z: false,
  };

  let value: { x: number; y: number; z: number };
  $: value = component[key];

  const onInputChange = (dimension) => (event) => {
    const newValue = parseFloat(event.target.value);
    if (!Number.isNaN(newValue) && component[key][dimension] !== newValue) {
      component[key][dimension] = newValue;
      component.modified();
      dispatch("modified");
      editing[dimension] = false;
    }
  };

  const onInputCancel = (dimension) => (event) => {
    editing[dimension] = false;
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => value[dimension],
      onDrag: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
      },
      onChange: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
        dispatch("modified");
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

<div>{(prop.editor && prop.editor.label) || key}:</div>
<div class="capsules">
  {#each ["x", "y", "z"] as dim}
    <Capsule
      editing={editing[dim]}
      on:mousedown={draggers[dim].mousedown}
      on:change={onInputChange(dim)}
      on:cancel={onInputCancel(dim)}
      label={dim.toUpperCase()}
      value={formatNumber(value[dim], editing[dim])}
    />
  {/each}
</div>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />

<style>
  div {
    margin-left: 16px;
    display: flex;
  }
  div.capsules {
    margin-top: 4px;
    margin-bottom: 6px;
    justify-content: center;
  }
</style>
