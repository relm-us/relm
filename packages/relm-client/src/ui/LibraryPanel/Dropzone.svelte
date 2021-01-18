<script>
  import { dropzones } from "./dropzones";
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { uuidv4 } from "~/utils/uuid";

  export let list;
  export let selected = false;

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
    display: block;

    border-width: 1px;
    border-style: solid;
    border-radius: 5px;

    width: 68px;
    height: 40px;

    margin: 8px;
    padding: 2px;

    text-align: center;
    overflow: hidden;
  }
  .selected {
    border: 1px solid var(--selected-red) !important;
    box-shadow: 0px 0px 0px 2px var(--selected-red);
  }

  @keyframes border-blink {
    from,
    to {
      box-shadow: inset 0px 0px 0px 2px transparent;
    }
    50% {
      box-shadow: inset 0px 0px 0px 2px white;
    }
  }
  .blink {
    animation: border-blink 0.15s step-end infinite;
  }

  :global(button.dropzone-favorite, button.dropzone-relm) {
    border-color: orange;
  }
  :global(button.dropzone-trash) {
    border-color: transparent;
  }
</style>

<button
  data-dropzone-id={dropzoneId}
  class="dropzone-{list.category}"
  class:selected
  class:blink={$active}
  on:click>
  <slot {list}>{list.name}</slot>
</button>
