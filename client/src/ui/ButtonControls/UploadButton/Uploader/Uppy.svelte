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
        allowedFileTypes: ["image/*", ".gltf", ".glb"],
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
        dispatch("uploaded", {
          results: result.successful.map((r) => ({
            name: r.meta.name,
            types: (r.response.body as any).files,
          })),
        });
      }
      if (result.failed.length > 0) {
        console.warn("upload failed", result);
      }
    });

    const dashboard = uppy.getPlugin("Dashboard") as Dashboard;
    uppy.on("dashboard:modal-closed", () => {
      dispatch("close");
    });

    dashboard.openModal();
  });

  onDestroy(() => ($uploadingDialogOpen = false));
</script>

<dashboard bind:this={dashboardElement} />
