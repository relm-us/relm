<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Capsule from "~/ui/lib/Capsule";
  import byteSize from "byte-size";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  const FILENAME_WITH_SIZE_RE = /^.+-([^\.]+)\..{1,5}$/;

  let editing = false;

  let value: string;
  $: value = component[key].url;

  const onInputChange = (event) => {
    const value = event.target.value.match(/^\s*$/)
      ? ""
      : event.target.value;
    Object.assign(component[key], {
      name: "",
      filename: "",
      url: value,
    });
    component[key].url = value;
    console.log("modified", value);
    component.modified();
    dispatch("modified");
    editing = false;
  };

  const onInputCancel = (event) => {
    editing = false;
  };

  function formatSizeInKb(filename) {
    if (filename) {
      const match = filename.match(FILENAME_WITH_SIZE_RE);
      if (match) {
        const size = byteSize(parseFloat(match[1]));
        return `${size.value} ${size.unit}`;
      }
    }
  }
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

  {#if formatSizeInKb(value)}
    <size>
      Size:
      {formatSizeInKb(value)}
    </size>
  {/if}
</div>

<style>
  div {
    margin: 8px 0px 6px 16px;
    --value-width: 100%;
  }
  size {
    display: block;
  }
</style>
