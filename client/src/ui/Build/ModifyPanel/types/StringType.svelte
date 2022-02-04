<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "~/ui/lib/Capsule";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = false;

  let value: string;
  $: value = component[key];

  const onInputChange = (event) => {
    component[key] = event.target.value;
    component.modified();
    dispatch("modified");
    editing = false;
  };

  const onInputCancel = (event) => {
    editing = false;
  };
</script>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Capsule
    {editing}
    on:mousedown={() => (editing = true)}
    on:change={onInputChange}
    on:cancel={onInputCancel}
    {value}
  />
</div>

<style>
  div {
    margin: 8px 0px 6px 16px;
    --value-width: 100%;
  }
</style>
