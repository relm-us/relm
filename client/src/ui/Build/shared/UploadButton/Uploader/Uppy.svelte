<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from "svelte";

  import Uppy from "@uppy/core";
  import Dashboard from "@uppy/dashboard";
  import XHRUpload from "@uppy/xhr-upload";

  import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";

  export let endpoint = "http://localhost:3000/asset";

  const dispatch = createEventDispatcher();

  let dashboardElement;

  onMount(() => {
    $uploadingDialogOpen = true;

    const uppy = new Uppy({
      debug: true,
      autoProceed: true,
      allowMultipleUploadBatches: false,
      restrictions: {
        maxFileSize: 1024 * 1024 * 16,
        maxNumberOfFiles: 12,
        minNumberOfFiles: 1,
        allowedFileTypes: [
          "image/*",
          ".gltf",
          ".glb",
          ".wav",
          ".mp3",
          ".ogg",
          ".webm",
        ],
      },
    })
      .use(XHRUpload, {
        endpoint,
        bundle: false, // send as single 'file'
        limit: 4, // simultaneous uploads
      })
      .use(Dashboard, {
        note: "Max file size: 4.0 MB each",
        trigger: null,
        target: dashboardElement,
        showProgressDetails: true,
        browserBackButtonClose: false,
        proudlyDisplayPoweredByUppy: false,
        closeAfterFinish: false,
      });

    uppy.on("complete", (result) => {
      if (result.successful.length > 0) {
        // Before dispatching the 'uploaded' signal, calculate image aspect ratios
        const aspects = {};
        Promise.all(
          result.successful.map(
            (file) =>
              new Promise<void>((resolve) => {
                if (file.preview) {
                  const image = new Image();
                  image.src = file.preview;
                  image.onload = () => {
                    aspects[file.id] = image.width / image.height;
                    resolve();
                  };
                } else {
                  // Not an image, so no need to calculate aspect ratio
                  resolve();
                }
              })
          )
        ).then(() => {
          dispatch("uploaded", {
            results: result.successful.map((r) => {
              return {
                name: r.meta.name,
                aspect: aspects[r.id],
                types: (r.response.body as any).files,
              };
            }),
          });
        });
      }
      if (result.failed.length > 0) {
        console.warn("upload failed", result);
      }
    });

    const dashboard = uppy.getPlugin("Dashboard") as Dashboard;
    uppy.on("dashboard:modal-open", () => {
      const el: Element = document.getElementsByClassName(
        "uppy-Dashboard-inner"
      )[0];
      if (el) {
        setTimeout(() => {
          (el as HTMLElement).click();
          (el as HTMLElement).focus();
        }, 500);
      }
    });
    uppy.on("dashboard:modal-closed", () => {
      dispatch("close");
    });

    dashboard.openModal();
  });

  onDestroy(() => {
    $uploadingDialogOpen = false;
  });
</script>

<dashboard bind:this={dashboardElement} />
