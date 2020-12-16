<script lang="ts">
  import { Euler, Quaternion } from "three";
  import { createEventDispatcher } from "svelte";

  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = {
    x: false,
    y: false,
    z: false,
  };

  const q1: Quaternion = new Quaternion();

  let value: Euler;
  $: value = new Euler(0, 0, 0, "YXZ").setFromQuaternion(component[key]); //component[key]

  function fmt(n) {
    return n === undefined ? "un" : n.toFixed(1);
  }

  const onInputChange = (dimension) => (event) => {
    value[dimension] = parseFloat(event.target.value);
    q1.setFromEuler(value);
    component[key].copy(q1);

    component.modified();
    dispatch("modified");
    editing[dimension] = false;
  };

  const onInputCancel = (dimension) => (event) => {
    editing[dimension] = false;
  };

  const setNewValue = (dimension, newValue, setModified) => {
    const floatValue = parseFloat(newValue);
    if (value[dimension] !== floatValue) {
      value[dimension] = floatValue;
      q1.setFromEuler(value);
      component[key].copy(q1);

      if (setModified) {
        component.modified();
        dispatch("modified");
      }
    }
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => value[dimension],
      onDrag: (newValue) => {
        setNewValue(dimension, newValue, false);
      },
      onChange: (newValue) => {
        setNewValue(dimension, newValue, true);
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
