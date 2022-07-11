<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string = null;
  export let value: any = "";
  export let suffix: string = "";
  export let type: "text" | "number" = "text";
  export let editable: boolean = true;
  export let editing: boolean = false;
  export let cursor = "default";
  export let maxWidth = true;

  let inputElement;

  const dispatch = createEventDispatcher();

  $: if (inputElement && editing) {
    inputElement.focus();
    inputElement.select();
  }

  function onChange(event) {
    dispatch("change", event.target.value);
  }

  function onBlur() {
    if (editable) {
      dispatch("cancel");
    }
  }

  function onFocus() {
    if (editable) {
      editing = true;
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      editing = false;
      event.target.blur();
    }
  }
</script>

<capsule>
  {#if label}
    <lbl>{label}</lbl>
  {/if}
  <value
    class:no-label={!label}
    class:max-width={maxWidth}
    on:mousedown
    on:keydown={onKeyDown}
    on:focus={onFocus}
    style={`cursor: ${cursor}`}
    tabindex="0"
  >
    {#if editable && editing}
      {#if type === "number"}
        <input
          bind:this={inputElement}
          {value}
          type="number"
          on:change={onChange}
          on:blur={onBlur}
        />
      {:else}
        <input
          bind:this={inputElement}
          bind:value
          type="text"
          on:change={onChange}
          on:blur={onBlur}
        />
      {/if}
    {:else if value !== undefined}
      <span class="value-text" tabindex="0">{value}{suffix}</span>
    {/if}
  </value>
</capsule>

<style>
  capsule {
    display: flex;
    align-items: center;
    font-size: 12px;
  }
  lbl {
    flex-shrink: 0;

    padding: 2px 6px 2px 8px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    text-align: right;
    background-color: rgba(255, 255, 255, 0.45);
    color: black;
    font-weight: bold;
  }
  value {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 30px;
    min-height: 18px;
    flex-grow: 1;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    text-align: center;
    word-break: keep-all;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;

    cursor: var(--cursor);
    width: var(--value-width, inherit);
  }
  .value-text {
    padding: 2px 8px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  value.max-width {
    max-width: var(--value-width, 45px);
  }
  value.no-label {
    min-width: 48px;
    margin: 4px 0px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    width: var(--input-width, 100%);
    border: 0;
    font-size: 12px;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
