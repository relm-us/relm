<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import byteSize from "byte-size";
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  // import Capsule from "~/ui/lib/Capsule";
  import TextInput from "~/ui/lib/TextInput/TextInput.svelte";
  import UploadButton from "~/ui/Build/shared/UploadButton";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  const FILENAME_WITH_SIZE_RE = /^.+-([^\.]+)\..{1,5}$/;

  let initialValue = component[key].url;

  let value: string;
  $: value = component[key].url;

  const onUpload = ({ detail }) => {
    console.log("onUpload", detail);
    for (const result of detail.results) {
      if (result.types.webp) {
        setAssetUrl(result.types.webp);
      } else if (result.types.gltf) {
        setAssetUrl(result.types.gltf);
      }
    }
  };

  const onInputChange = (event) => {
    let url = event.target.value;
    if (url.match(/^\s*$/)) value = "";
    setAssetUrl(url);
  };

  function setAssetUrl(value) {
    Object.assign(component[key], {
      name: "",
      filename: "",
      url: value,
    });
    component[key].url = value;
    component.modified();
    dispatch("modified");
  }

  function onDeleteAsset() {
    setAssetUrl("");
  }

  const onInputCancel = (event) => {
    value = initialValue;
  };

  function formatSizeInKb(filename) {
    if (filename) {
      const match = filename.match(FILENAME_WITH_SIZE_RE);
      if (match) {
        const size = byteSize(parseFloat(match[1]));
        return `${size.value} ${size.unit}`;
      }
    }
  }
</script>

<r-asset-type>
  {(prop.editor && prop.editor.label) || key}:

  <r-text>
    <TextInput {value} on:change={onInputChange} on:cancel={onInputCancel} />
  </r-text>

  {#if value && value !== ""}
    <r-row>
      {#if formatSizeInKb(value)}
        <r-size>
          Size:
          <div>{formatSizeInKb(value)}</div>
        </r-size>
      {/if}
      <r-delete on:click={onDeleteAsset}>
        <icon><IoIosClose /></icon>
      </r-delete>
    </r-row>
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
  }
  r-upload-button {
    display: flex;
    justify-content: center;
    margin: 12px 0;
  }
  r-row {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  r-delete:hover {
    background-color: black;
    border-radius: 4px;
  }
  icon {
    display: block;
    width: 20px;
    height: 20px;
  }
</style>
