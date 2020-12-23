<script lang="ts">
  import { onMount } from "svelte";
  import Dropzone from "dropzone";

  import Cropper from "./Cropper.svelte";

  export let element: HTMLElement = document.body;
  export let uploadUrl: string;

  // Don't look for 'dropzone' in HTML tags
  Dropzone.autoDiscover = false;

  let previewsVisible = false;
  let cropperVisible = false;

  let previews;
  let clickable;
  let dropzone;
  let image;
  let transformFile: string;
  let transformDone: Function;

  export const showSelectFileDialog = () => {
    dropzone.hiddenFileInput.click();
  };

  function onCropDone({ detail }) {
    const canvas = detail.canvas;
    canvas.toBlob((blob) => {
      transformDone(blob);
      dropzone.createThumbnail(
        blob,
        dropzone.options.thumbnailWidth,
        dropzone.options.thumbnailHeight,
        dropzone.options.thumbnailMethod,
        false,
        function (dataURL) {
          // Update the Dropzone file thumbnail
          dropzone.emit("thumbnail", transformFile, dataURL); // Return the file to Dropzone
          transformDone(blob);
        }
      );
    });
    cropperVisible = false;
  }

  onMount(() => {
    console.log("previews", previews);
    dropzone = new Dropzone(element, {
      url: uploadUrl,
      clickable,
      previewsContainer: previews,
      transformFile: (file, done) => {
        console.log("transform file", file, done);
        cropperVisible = true;
        image = URL.createObjectURL(file);
        transformFile = file;
        transformDone = done;
      },
    });
    dropzone.on("addedfile", (file) => {
      previewsVisible = true;
    });
    dropzone.on("error", async (dz, error, xhr) => {
      previewsVisible = false;
      // showToast(`Unable to upload: ${error.reason} (note: 2MB file size limit)`)
    });
    dropzone.on("success", async (dz, response) => {
      // Close the upload box automatically
      previewsVisible = false;

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

    return () => {
      console.log("dstry");
      dropzone.destroy();
    };
  });

  /*
   */
</script>

<style>
  previews {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    max-width: 500px;
    text-align: center;
    border-radius: 10px;
    border: none;
    background: rgba(0, 0, 0, 0.25);

    display: none;
  }
  previews.visible {
    display: block;
  }

  clickable {
    display: none;
  }
</style>

<!--
  We need to create a 'hidden' clickable element here so that Dropzone
  goes on to create its own 'hidden' file input; then, we can trigger the
  file selection dialog box via dropzone.hiddenFileInput.click()
-->
<clickable bind:this={clickable} />

<previews
  bind:this={previews}
  class:visible={previewsVisible}
  class="dropzone dropzone-previews" />

{#if cropperVisible}
  <Cropper {image} on:done={onCropDone} />
{/if}
