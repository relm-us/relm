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
    <div class="name">{name}</div>
    <div class="coords">({format(coords)})</div>
  </entryway>
{/each}

<style>
  entryway {
    display: flex;
    width: 200px;
    text-overflow: ellipsis;
  }

  div {
    flex-shrink: 0;
  }
  div.name {
    font-weight: bold;
  }
  div.coords {
    padding-left: 8px;
  }

  div.delete {
    width: 24px;
    height: 24px;
    cursor: pointer;
    margin-right: 16px;
  }
</style>
