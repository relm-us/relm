<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = false;

  let value;
  $: value = component[key];

  function fmt(n) {
    if (typeof n === "string") {
      return n;
    } else if (typeof n === "number") {
      return n.toFixed(3);
    } else if (n === undefined) {
      return "[undefined]";
    } else {
      console.warn("unknown type of NumberType", n);
      return "[unknown]";
    }
  }

  const onInputChange = (event) => {
    component[key] = parseFloat(event.target.value);
    component.modified();
    dispatch("modified");
    editing = false;
  };

  const onInputCancel = (event) => {
    editing = false;
  };

  const dragger = new NumberDragger({
    getValue: () => value,
    onDrag: (newValue) => {
      component[key] = newValue;
    },
    onChange: (newValue) => {
      component[key] = newValue;
      component.modified();
      dispatch("modified");
    },
    onClick: () => {
      editing = true;
    },
  });
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Capsule
    {editing}
    on:mousedown={dragger.mousedown}
    on:change={onInputChange}
    on:cancel={onInputCancel}
    value={fmt(value)} />
</div>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />
