<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import NumberInput from "./utils/NumberInput.svelte";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  function onValueChanged({ detail }) {
    component[key] = detail.value;
    component.modified();
    if (detail.final) {
      dispatch("modified");
    }
  }

  // ignore warning about missing props
  $$props;
</script>

<r-number-type>
  <div class="label">
    {(prop.editor && prop.editor.label) || key}:
  </div>

  <div class="capsule">
    <NumberInput
      on:value={onValueChanged}
      value={component[key]}
      decimals={3}
      scaleFactor={prop.editor.increment ?? 1}
      min={prop.editor.min ?? null}
      max={prop.editor.max ?? null}
    />
  </div>
</r-number-type>

<style>
  r-number-type {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
  }
</style>
