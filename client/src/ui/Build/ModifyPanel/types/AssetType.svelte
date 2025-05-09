<script lang="ts">
import { createEventDispatcher } from "svelte"
import byteSize from "byte-size"
import IoIosClose from "svelte-icons/io/IoIosClose.svelte"

// import Capsule from "~/ui/lib/Capsule";
import TextInput from "~/ui/lib/TextInput/TextInput.svelte"
import UploadButton from "~/ui/Build/shared/UploadButton"

import { _ } from "~/i18n"

export let key: string
export let component
export let prop

const dispatch = createEventDispatcher()

const FILENAME_WITH_SIZE_RE = /^.+-([^\.]+)\..{1,5}$/

let initialValue = component[key].url

let value: string
$: value = component[key].url

const onUpload = ({ detail }) => {
  for (const result of detail.results) {
    if (result.types.webp) {
      setAssetUrl(result.types.webp)
    } else if (result.types.gltf) {
      setAssetUrl(result.types.gltf)
    } else if (result.types.sound) {
      setAssetUrl(result.types.sound)
    }
  }
}

const onInputChange = (event) => {
  let url = event.detail
  if (url.match(/^\s*$/)) value = ""
  setAssetUrl(url)
}

function setAssetUrl(value) {
  Object.assign(component[key], {
    name: "",
    filename: "",
    url: value,
  })
  component[key].url = value
  component.modified()
  dispatch("modified")
}

function onDeleteAsset() {
  setAssetUrl("")
}

const onInputCancel = (event) => {
  value = initialValue
}

function formatSizeInKb(filename) {
  if (filename) {
    const match = filename.match(FILENAME_WITH_SIZE_RE)
    if (match) {
      const size = byteSize(parseFloat(match[1]))
      return `${size.value} ${size.unit}`
    }
  }
}

// ignore warning about missing props
$$props
</script>

<r-asset-type>
  {(prop.editor && prop.editor.label) || key}:

  <r-text>
    <TextInput {value} on:change={onInputChange} on:cancel={onInputCancel} />
  </r-text>

  {#if value && value !== ""}
    <r-detail>
      {#if formatSizeInKb(value)}
        <r-size>
          {$_("AssetType.size")}
          <div>{formatSizeInKb(value)}</div>
        </r-size>
      {:else}
        <div>unknown size</div>
      {/if}
      <button class="delete" on:click={onDeleteAsset}>
        <icon><IoIosClose /></icon>
      </button>
    </r-detail>
  {/if}

  <r-upload-button>
    <UploadButton on:uploaded={onUpload} />
  </r-upload-button>
</r-asset-type>

<style>
  r-asset-type {
    display: block;
    --value-width: 100%;
  }
  r-text {
    display: block;
    margin-top: 4px;
  }
  r-size {
    display: flex;
  }
  r-size > div {
    flex-grow: 1;
    font-weight: bold;
    text-align: center;
    padding-left: 6px;
  }
  r-upload-button {
    display: flex;
    justify-content: center;
    margin: 12px 0;
  }
  r-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 11px;

    margin: 0 4px;
    background: #444;
    padding: 3px 6px 2px 6px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  button.delete {
    display: flex;
    background: none;
    border: 0;
    padding: 0;
    color: var(--foreground-white);
  }
  button.delete:hover {
    background-color: black;
    border-radius: 4px;
  }
  icon {
    display: block;
    width: 20px;
    height: 20px;
  }
</style>
