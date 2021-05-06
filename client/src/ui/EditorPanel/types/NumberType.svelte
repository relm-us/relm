<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "~/ui/Capsule";
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
    const newValue = parseFloat(event.target.value);
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

<container>
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
</container>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />

<style>
  container {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
  }

  div.label {
    margin-left: 16px;
  }
  div.capsule {
    margin-left: 8px;
  }
</style>
