<script lang="ts">
  import Tag from "../Tag.svelte";
  import { NumberDragger } from "../NumberDragger";

  export let key: string;
  export let component;
  export let prop;

  let editMode = false;

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
    component[key] = event.target.value;
    component.modified();
    editMode = false;
  };

  const onInputCancel = (event) => {
    editMode = false;
  };

  const dragger = new NumberDragger({
    getValue: () => value,
    onChange: (newValue) => {
      component[key] = newValue;
      component.modified();
    },
    onClick: () => {
      editMode = true;
    },
  });
</script>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    width: 60px;
    border: 0;
  }
</style>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Tag on:mousedown={dragger.mousedown}>
    {#if editMode}
      <input
        {value}
        type="number"
        on:change={onInputChange}
        on:blur={onInputCancel} />
    {:else}{fmt(value)}{/if}
  </Tag>
</div>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />
