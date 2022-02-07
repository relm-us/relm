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

  const onInputChange = ({ detail }) => {
    component[key] = detail;
    component.modified();
    dispatch("modified");
    editing = false;
  };

  const onInputCancel = (event) => {
    editing = false;
  };
</script>

<r-string-type>
  {(prop.editor && prop.editor.label) || key}:

  <Capsule
    {editing}
    on:mousedown={() => (editing = true)}
    on:change={onInputChange}
    on:cancel={onInputCancel}
    {value}
  />
</r-string-type>

<style>
  r-string-type {
    --value-width: 100%;
  }
</style>
