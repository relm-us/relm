<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string = null;
  export let value: any;
  export let editable: boolean = true;
  export let editing: boolean = false;
  export let cursor = "default";

  let inputElement;

  const dispatch = createEventDispatcher();

  $: if (inputElement && editing) {
    inputElement.focus();
    inputElement.select();
  }

  const onBlur = () => {
    if (editable) {
      dispatch("cancel");
    }
  };

  const onFocus = () => {
    if (editable) {
      editing = true;
    }
  };
</script>

<capsule>
  {#if label}
    <lbl>{label}</lbl>
  {/if}
  <value
    class:tag={!label}
    on:mousedown
    on:focus={onFocus}
    style={`cursor: ${cursor}`}
    tabindex="0"
  >
    {#if editable && editing}
      <input
        bind:this={inputElement}
        {value}
        type={typeof value === "string" ? "text" : "number"}
        on:change
        on:blur={onBlur}
      />
    {:else}{value}{/if}
  </value>
</capsule>

<style>
  capsule {
    margin: 0px 8px 0px 0px;
    display: flex;
    font-size: 12px;
  }
  lbl {
    padding: 2px 6px 2px 8px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    text-align: right;
    background-color: rgba(255, 255, 255, 0.45);
    color: black;
    font-weight: bold;
  }
  value {
    min-width: 30px;
    min-height: 15px;
    padding: 2px 8px 2px 4px;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;

    cursor: var(--cursor);
    width: var(--value-width, inherit);
  }
  value.tag {
    min-width: 48px;
    margin: 4px 8px 4px 0px;
    padding: 2px 8px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    width: var(--input-width, 100%);
    border: 0;
  }
</style>
