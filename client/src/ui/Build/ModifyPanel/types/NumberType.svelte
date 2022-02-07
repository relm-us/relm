<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "~/ui/lib/Capsule";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = false;

  let value;
  $: value = component[key];

  const onInputChange = ({ detail }) => {
    const newValue = parseFloat(detail);
    if (!Number.isNaN(newValue)) {
      component[key] = newValue;
      component.modified();
      dispatch("modified");
      editing = false;
    }
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

<r-number-type>
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
      type="number"
    />
  </div>
</r-number-type>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />

<style>
  r-number-type {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
  }
</style>
