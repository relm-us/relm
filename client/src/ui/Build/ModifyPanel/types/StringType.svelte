<script lang="ts">
import { createEventDispatcher } from "svelte"
import TextInput from "~/ui/lib/TextInput"

export let key: string
export let component
export let prop

const dispatch = createEventDispatcher()

let initialValue = component[key].url

let value: string
$: value = component[key]

const onInputChange = ({ detail }) => {
  component[key] = detail
  component.modified()
  dispatch("modified")
}

const onInputCancel = (event) => {
  value = initialValue
}

// ignore warning about missing props
$$props
</script>

<r-string-type>
  <r-label>
    {(prop.editor && prop.editor.label) || key}:
  </r-label>

  <TextInput {value} on:change={onInputChange} on:cancel={onInputCancel} />
</r-string-type>

<style>
  r-string-type {
    --value-width: 100%;
  }
  r-label {
    display: block;
    margin: 4px 0;
  }
</style>
