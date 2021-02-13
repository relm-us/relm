<script lang="ts">
  import Capsule from "../Capsule.svelte";

  export let key: string;
  export let component;
  export let prop;

  let editing = false;

  let value: string;
  $: value = component[key].url;

  const onInputChange = (event) => {
    component[key].url = event.target.value;
    component.modified();
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
