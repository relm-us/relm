<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Capsule from "~/ui/lib/Capsule";

  import { NumberDragger } from "./NumberDragger";
  import { formatNumber } from "./formatNumber";
  import { onMount } from "svelte";

  export let label = null;
  export let value: number;
  export let decimals = 1;
  export let scaleFactor = 1;

  const dispatch = createEventDispatcher();

  let editing = false;
  let originalValue;

  const setValue = (final: boolean) => (newValue: number) => {
    // Ignore no-ops
    if (!final && value === newValue) return;
    if (final && value === originalValue) return;

    // Set local value
    value = newValue;

    // Notify components 'above' to also set value
    dispatch("value", { value, final });
  };

  function onChange({ detail }) {
    const newValue = parseFloat(detail);
    if (!Number.isNaN(newValue)) {
      setValue(true)(newValue);
      editing = false;
    }
  }

  function onCancel(event) {
    editing = false;
  }

  const dragger = new NumberDragger({
    scaleFactor,
    getValue: () => value,
    onDrag: setValue(false),
    onChange: setValue(true),
    onClick: () => (editing = true),
  });

  onMount(() => {
    originalValue = value;
  });
</script>

<Capsule
  {editing}
  {label}
  on:mousedown={dragger.mousedown}
  on:change={onChange}
  on:cancel={onCancel}
  value={formatNumber(value, editing, decimals)}
  type="number"
/>

<svelte:window on:mousemove={dragger.mousemove} on:mouseup={dragger.mouseup} />
