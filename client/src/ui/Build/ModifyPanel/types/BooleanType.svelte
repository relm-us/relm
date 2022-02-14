<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  /**
   * Boolean values can be a simple true/false, OR they
   * can be a lookup for two values, allowing the user
   * interface to appear to be an on/off switch that actually
   * drives a setter that has inputTrue/inputFalse lookups
   * going on underneath.
   *
   * Original use: Allow a toggle to switch between collider
   *   bitmask that allows objects to collide in build mode.
   *   See Collider.ts `interaction` prop.
   */
  const isLookup = prop.editor && "inputTrue" in prop.editor;

  let value: boolean;
  $: {
    if (isLookup) {
      value = component[key] === prop.editor.inputTrue;
    } else {
      // Simple boolean
      value = component[key];
    }
  }

  const onChange = (event) => {
    if (isLookup) {
      if (event.detail) {
        component[key] = prop.editor.inputTrue;
      } else {
        component[key] = prop.editor.inputFalse;
      }
    } else {
      component[key] = event.detail;
    }
    component.modified();
    dispatch("modified");
  };
</script>

<r-boolean-type>
  {(prop.editor && prop.editor.label) || key}:

  <div>
    <ToggleSwitch enabled={value} on:change={onChange} />
  </div>
</r-boolean-type>

<style>
  r-boolean-type {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  div {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    margin-top: 4px;
  }
</style>
