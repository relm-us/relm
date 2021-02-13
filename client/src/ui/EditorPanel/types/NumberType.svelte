<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "../Capsule.svelte";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = false;

  let value;
  $: value = component[key];

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
      component.modified();
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

<div>
  <div class="label">
    {(prop.editor && prop.editor.label) || key}:
  </div>

  <div class="capsule">
    <Capsule
      {editing}
      on:mousedown={dragger.mousedown}
      on:change={onInputChange}
      on:cancel={onInputCancel}
      value={formatNumber(value, editing, 3)}
    />
  </div>
</div>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />

<style>
  div {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
    align-items: center;
  }

  div.label {
    margin-left: 16px;
    flex-grow: 1;
  }
  div.capsule {
    margin-left: 8px;
    flex-grow: 1;
  }
</style>
