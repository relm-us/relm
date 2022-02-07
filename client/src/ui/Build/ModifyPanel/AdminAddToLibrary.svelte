<script lang="ts">
  import { get } from "svelte/store";
  import { Pane } from "~/ui/lib/LeftPanel";
  import UploadButton from "~/ui/Build/shared/UploadButton";
  import Capsule from "~/ui/lib/Capsule";
  import Button from "~/ui/lib/Button";
  import { worldManager } from "~/world";
  import { copy } from "~/events/input/CopyPasteListener/copy";
  import { copyBuffer } from "~/stores/copyBuffer";
  import { serializeCopyBuffer } from "~/events/input/CopyPasteListener/common";
  import { getNotificationsContext } from "svelte-notifications";

  const notifyContext = getNotificationsContext();

  let thumbnail;
  let name = "";
  let description = "";
  let tags = "";

  const onUpload = ({ detail }) => {
    // console.log("onUpload image for library", detail);
    thumbnail = detail.results[0].types.webp;
  };

  const addAsset = async () => {
    // TODO: factor out parts unrelated to copy/paste?
    copy();

    const buffer = JSON.parse(serializeCopyBuffer(get(copyBuffer)));

    const asset = {
      name,
      description,
      tags: (tags || "").split(/\s*,\s*/),
      thumbnail,
      ecsProperties: { ...buffer },
    };

    let success;
    try {
      success = await worldManager.api.addAsset(asset);
    } catch (err) {
      success = false;
    }

    if (success) {
      notifyContext.addNotification({
        text: "Added asset to library",
        position: "bottom-center",
        removeAfter: 3000,
      });
    } else {
      console.warn("asset", asset);
      notifyContext.addNotification({
        text: "Something went wrong",
        position: "bottom-center",
        removeAfter: 3000,
      });
    }
  };
</script>

<Pane title="Add to Library">
  <r-form>
    <div>
      <r-label>Thumbnail:</r-label>
      {#if thumbnail}
        Uploaded!
      {:else}
        <r-upload>
          <UploadButton on:uploaded={onUpload} />
        </r-upload>
      {/if}
    </div>
    <Capsule
      label="Name"
      value={name}
      maxWidth={false}
      on:change={({ detail }) => (name = detail)}
    />
    <Capsule
      label="Description"
      value={description}
      maxWidth={false}
      on:change={({ detail }) => (description = detail)}
    />
    <Capsule
      label="Tags (,)"
      value={tags}
      maxWidth={false}
      on:change={({ detail }) => (tags = detail)}
    />
    <Button on:click={addAsset}>Add</Button>
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
