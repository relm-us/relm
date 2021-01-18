<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  import Uppy from "@uppy/core";
  import Dashboard from "@uppy/dashboard";
  import XHRUpload from "@uppy/xhr-upload";
  import Webcam from "@uppy/webcam";
  import ScreenCapture from "@uppy/screen-capture";
  import ImageEditor from "@uppy/image-editor";

  export let endpoint = "http://localhost:3000/asset";

  const dispatch = createEventDispatcher();

  let dashboardElement;

  onMount(() => {
    const uppy = Uppy({
      debug: true,
      autoProceed: false,
      allowMultipleUploads: false,
      restrictions: {
        maxFileSize: 1024 * 1024 * 4,
        maxNumberOfFiles: 12,
        minNumberOfFiles: 1,
        allowedFileTypes: ["image/*", ".gltf", ".glb"],
      },
    })
      .use(XHRUpload, {
        endpoint,
        limit: 4,
      })
      .use(Dashboard, {
        trigger: false,
        // inline: true,
        // maxWidth: 300,
        // maxHeight: 350,

        target: dashboardElement,
        replaceTargetContent: true,
        showProgressDetails: true,

        note: "Up to 12 images, max 4 MB each",
        metaFields: [
          { id: "name", name: "Name", placeholder: "file name" },
          { id: "author", name: "Author", placeholder: "attribution" },
        ],
        browserBackButtonClose: false,
        proudlyDisplayPoweredByUppy: false,
        closeAfterFinish: true,
      })
      .use(Webcam, { target: Dashboard, modes: ["picture"] })
      .use(ScreenCapture, { target: Dashboard })
      .use(ImageEditor, {
        target: Dashboard,
        actions: {
          zoomIn: false,
          zoomOut: false,
          cropSquare: false,
          cropWidescreen: false,
          cropWidescreenVertical: false,
        },
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
</script>

<dashboard bind:this={dashboardElement} />
