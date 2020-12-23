<script lang="ts">
  import { onMount } from "svelte";

  import Dropzone from "dropzone";

  import { config } from "~/stores/config";

  // Don't look for 'dropzone' in HTML tags
  Dropzone.autoDiscover = false;

  let previewsEl;
  let uploadVisible = false;

  onMount(async () => {
    const dropzone = new Dropzone(document.body, {
      url: config.SERVER_UPLOAD_URL,
      clickable: "#upload-button",
      previewsContainer: previewsEl,
      maxFiles: 1,
    });
    dropzone.on("addedfile", (file) => {
      uploadVisible = true;
    });
    dropzone.on("error", async (dz, error, xhr) => {
      uploadVisible = false;
      // showToast(`Unable to upload: ${error.reason} (note: 2MB file size limit)`)
    });
    dropzone.on("success", async (dz, response) => {
      // Close the upload box automatically
      uploadVisible = false;

      console.log("Uploaded file variants:", response.files);
      // Add the asset to the network so everyone can see it
      // response.files.[webp|png|glb|gltf]
    });
    dropzone.on("complete", (a) => {
      dropzone.removeAllFiles();
    });

    document.addEventListener("paste", (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === "file") {
          // adds the file to your dropzone instance
          dropzone.addFile(item.getAsFile());
        }
      }
    });
  });

  /*
   */
</script>

<style>
  .show {
    display: block;
  }
  .hide {
    display: none;
  }
</style>

<div
  bind:this={previewsEl}
  class="dropzone dropzone-previews"
  class:hide={!uploadVisible}
  class:show={uploadVisible} />
