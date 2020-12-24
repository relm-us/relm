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
        // trigger: ".UppyModalOpenerBtn",
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
      .use(Webcam, { target: Dashboard })
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
      console.log("successful files:", result.successful);
      console.log("failed files:", result.failed);
    });

    const dashboard = uppy.getPlugin("Dashboard") as Dashboard;
    uppy.on("dashboard:modal-closed", () => {
      dispatch("close");
    });

    dashboard.openModal();
  });
</script>

<dashboard bind:this={dashboardElement} />
