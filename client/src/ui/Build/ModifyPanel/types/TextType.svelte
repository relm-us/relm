<script lang="ts">
import { createEventDispatcher } from "svelte"

export let key
export let component
export let prop

export let formatInput = (value) => value
export let formatOutput = (value) => value

function onChange(event) {
  component[key] = formatOutput(event.target.value)
  component.modified()
  dispatch("modified")
}

const dispatch = createEventDispatcher()

function resize(event) {
  event.target.style.height = ""
  event.target.style.height = event.target.scrollHeight + "px"
}

// ignore warning about missing props
$$props
</script>

<r-json-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="fixed-width">
    <textarea
      spellcheck="false"
      on:focus={resize}
      on:input={resize}
      on:change={onChange}>{formatInput(component[key])}</textarea
    >
  </div>
</r-json-type>

<style>
  r-json-type {
    display: block;
  }
  textarea {
    width: calc(100% - 8px);
    margin: 8px 0;
    overflow-wrap: anywhere;
    resize: vertical;
    max-height: 120px;
  }
  .fixed-width {
    font-family: monospace;
  }
</style>
