<script>
  import { dropzones } from "./dropzones";
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { uuidv4 } from "~/utils/uuid";

  export let list;
  export let selected;

  let dropzoneId = uuidv4();
  const BLINK_DURATION = 290;
  const dispatch = createEventDispatcher();

  const active = writable(false);

  active.subscribe(($active) => {
    if ($active) {
      setTimeout(() => active.set(false), BLINK_DURATION);
    }
  });

  $: dropzones.set(dropzoneId, { list, dispatch, active });

  let items = [];
</script>

<style>
  button {
    all: unset;

    width: 80px;
    height: 80px;

    margin: 8px;
  }
  .selected {
    border: 1px solid orange !important;
    box-shadow: 0px 0px 0px 2px orange;
  }
  @keyframes border-blink {
    from,
    to {
      border-color: transparent;
    }
    50% {
      border-color: black;
    }
  }
  .border-blink {
    border: 1px dashed orange;
    /* add 'border-color: transparent' if you wish no border to show initially */
  }
  .border-blink.active {
    animation: border-blink 0.15s step-end infinite;
  }
</style>

<button
  data-dropzone-id={dropzoneId}
  class="border-blink"
  class:selected
  class:active={$active}
  on:click>
  {list.name}
  {#each items as item (item.id)}
    <item data-id={item.id}>{item.name}<br />{item.id}</item>
  {/each}
</button>
