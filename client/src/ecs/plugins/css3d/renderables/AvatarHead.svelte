<script lang="ts">
  export let width: number;
  export let height: number;

  const names = [null, "chris", "rey", "alex", "duane"];
  let nameIndex = 0;

  let name = names[nameIndex];

  const toggleProfile = () => {
    nameIndex++;
    if (nameIndex >= names.length) nameIndex = 0;
    name = names[nameIndex];
  };

  // ignore warning about missing props
  $$props;
</script>

<div
  style="--width: {width}px; --height: {height}px"
  on:mousedown|stopPropagation={toggleProfile}
>
  {#if name === null}
    <whitebox />
  {:else}<img {width} {height} src="/{name}.jpg" alt="Head" />{/if}
</div>

<style>
  div {
    width: var(--width);
    height: var(--height);
    overflow: hidden;

    border-radius: 100%;
    box-shadow: inset 0px 0px 0px 4px rgba(0, 0, 0, 0.75);
  }
  img {
    display: block;
    object-fit: contain;
  }
  whitebox {
    border-radius: 100%;
    box-shadow: inset 0px 0px 0px 4px rgba(0, 0, 0, 0.75);
    display: block;
    background-color: rgba(200, 200, 200, 1);
    width: var(--width);
    height: var(--height);
  }
</style>
