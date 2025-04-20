<script lang="ts">
import { createEventDispatcher } from "svelte"

export let label: string = null
export let value: any = ""

let inputEl
let initialValue = value
let canceling = false

const dispatch = createEventDispatcher()

const onChange = (event) => {
  if (canceling) return
  dispatch("change", event.target.value)
}

const onFocus = (event) => {
  canceling = false
}

const onKeydown = (event) => {
  if (event.key === "Escape") {
    value = initialValue
    canceling = true
    dispatch("cancel")
    inputEl.blur()
  } else {
    dispatch("keydown", event.key)
  }
}
</script>

<r-text-input>
  {#if label}
    <r-label>{label}</r-label>
  {/if}

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <r-input class:no-label={!label} on:mousedown tabindex="0">
    <input
      type="text"
      bind:this={inputEl}
      bind:value
      on:change={onChange}
      on:focus={onFocus}
      on:blur
      on:keydown={onKeydown}
    />
  </r-input>
</r-text-input>

<style>
  r-text-input {
    display: flex;
    align-items: center;
    font-size: var(--font-size, 12px);
  }
  r-label {
    flex-shrink: 0;

    padding: 2px 6px 2px 8px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    text-align: right;
    background-color: rgba(255, 255, 255, 0.45);
    color: black;
    font-weight: bold;
  }
  r-input {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 30px;
    min-height: 18px;
    flex-grow: 1;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    text-align: center;
    word-break: break-all;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;

    width: var(--value-width, inherit);
    padding: 0 6px;
  }
  r-input.no-label {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    width: var(--input-width, 100%);
    border: 0;
    font-size: var(--font-size, 12px);
  }
</style>
