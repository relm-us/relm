<script lang="ts">
  import Capsule from "~/ui/Capsule";
  import byteSize from "byte-size";

  export let key: string;
  export let component;
  export let prop;

  const FILENAME_WITH_SIZE_RE = /^.+-([^\.]+)\..{1,5}$/;

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
