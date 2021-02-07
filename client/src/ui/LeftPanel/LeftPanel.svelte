<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";

  const dispatch = createEventDispatcher();
</script>

<panel>
  <button on:click={() => dispatch("minimize")}>
    <IoIosArrowBack />
  </button>
  <slot />
</panel>

<style>
  panel {
    position: relative;
    display: flex;
    flex-direction: column;

    width: 300px;
    height: 100%;

    background-color: var(--background-transparent-gray);
    color: var(--foreground-white);

    overflow-y: auto;
    pointer-events: all;
  }
  button {
    position: absolute;
    right: 4px;
    top: 4px;

    display: block;
    width: 40px;
    height: 40px;

    border: 0;
    background: none;
    color: #dddddd;

    cursor: pointer;
  }
</style>
