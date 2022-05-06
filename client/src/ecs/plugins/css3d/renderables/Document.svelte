<script lang="ts">
  import { onMount } from "svelte";
  import { QuillBinding } from "y-quill";
  import Quill from "quill";
  import { worldManager } from "~/world";
  // import QuillCursors from "quill-cursors";

  // Quill.register("modules/cursors", QuillCursors);

  export let docId: string;
  export let width: number;
  export let height: number;
  export let editable: boolean;
  export let visible: boolean;

  let container;

  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#efefef",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
  ];

  onMount(() => {
    var editor = new Quill(container, {
      modules: {
        // cursors: true,
        toolbar: [
          [{ header: [1, 2, false] }, { align: ["", "center", "right"] }],
          ["bold", "italic", "underline", "strike"],
          ["image", "blockquote", "code-block"],
          [{ color: colors }, { background: colors }],
        ],
      },
      placeholder: "Start collaborating...",
      theme: "snow", // or 'bubble'
    });

    const interval = setInterval(() => {
      if (worldManager.worldDoc) {
        const type = worldManager.worldDoc.ydoc.getText(docId);
        const binding = new QuillBinding(
          type,
          editor /*, provider.awareness */
        );
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  });

  $$props;
</script>

<r-document>
  <div bind:this={container} />
</r-document>

<style>
  r-document {
    display: block;
    background-color: white;
    height: 100%;
  }
</style>
