<script lang="ts">
import { get } from "svelte/store"
import { toast } from "@zerodevx/svelte-toast"

import { worldManager } from "~/world"

import Pane from "~/ui/lib/Pane"
import UploadButton from "~/ui/Build/shared/UploadButton"
import Button from "~/ui/lib/Button"
import TextInput from "~/ui/lib/TextInput"

import { serializeCopyBuffer } from "~/events/input/CopyPasteListener/common"
import { copy } from "~/events/input/CopyPasteListener/copy"

import { copyBuffer } from "~/stores/copyBuffer"
import { _ } from "~/i18n"

let thumbnail
let name = ""
let description = ""
let tags = ""

const onUpload = ({ detail }) => {
  // console.log("onUpload image for library", detail);
  thumbnail = detail.results[0].types.webp
}

const addAsset = async () => {
  // TODO: factor out parts unrelated to copy/paste?
  copy()

  const buffer = JSON.parse(serializeCopyBuffer(get(copyBuffer)))

  const asset = {
    name,
    description,
    tags: (tags || "").split(/\s*,\s*/),
    thumbnail,
    ecsProperties: { ...buffer },
  }

  let success
  try {
    success = await worldManager.api.addAsset(asset)
  } catch (err) {
    success = false
  }

  if (success) {
    toast.push("Added asset to library")
  } else {
    console.warn("asset", asset)
    toast.push("Something went wrong")
  }
}
</script>

<Pane title="Add to Library">
  <r-form>
    <div>
      <r-label>{$_("AdminAddToLibrary.thumbnail")}:</r-label>
      {#if thumbnail}
        {$_("AdminAddToLibrary.uploaded")}
      {:else}
        <r-upload>
          <UploadButton on:uploaded={onUpload} />
        </r-upload>
      {/if}
    </div>
    <TextInput label="Name" bind:value={name} />
    <TextInput label="Description" bind:value={description} />
    <TextInput label="Tags (,)" bind:value={tags} />
    <Button on:click={addAsset}>{$_("AdminAddToLibrary.add")}</Button>
  </r-form>
</Pane>

<style>
  r-form {
    display: flex;
    flex-direction: column;
    --input-width: 100%;
  }
  r-form > :global(*) {
    margin: 4px;
  }
  r-upload {
    display: flex;
    justify-content: center;
  }
</style>
