<script>
  import { createEventDispatcher } from "svelte";
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  export let entryways;

  const dispatch = createEventDispatcher();

  function format(coords) {
    return `${coords[0].toFixed(1)}, ${coords[1].toFixed(
      1
    )}, ${coords[2].toFixed(1)}`;
  }
</script>

{#each [...$entryways] as [name, coords]}
  <entryway>
    <div class="delete" on:click={() => dispatch("delete", name)}>
      <IoIosClose />
    </div>
    <r-content>
      <div class="name">{name}</div>
      <div class="coords">({format(coords)})</div>
    </r-content>
  </entryway>
{/each}

<style>
  entryway {
    display: flex;
    flex-direction: row-reverse;
    background: #666;
    margin-top: 3px;
    margin-bottom: 3px;
    padding: 5px;
    border-radius: 5px;
  }

  r-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  div {
    flex-shrink: 0;
  }
  div.name {
    font-weight: bold;
  }

  div.delete {
    width: 24px;
    height: 24px;
    cursor: pointer;
    margin-left: 8px;
  }
</style>
