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

  // prettier-ignore
  const colors = [
    "#000000","#434343","#999999","#cccccc","#efefef",
    "#ae081e","#ad4736","#c0775c","#ebc9b2","#521510",
    "#cd5432","#c45f2b","#eb8572","#f4b490","#9e440d",
    "#e58d27","#f0b526","#f2d631","#ece6ba","#c78b35",
    "#10866f","#6cb47c","#89cf82","#cef5e1","#225f34",
    "#086b75","#2188dd","#67b7d4","#81e2ea","#5d80b4",
    "#696daa","#906aa1","#d8bbcd","#c9ceec","#4f3b47",
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

<r-document data-pointer-interact="1">
  <div bind:this={container} />
</r-document>

<style>
  r-document {
    display: block;
    background-color: white;
    height: 100%;
  }

  r-document :global(.ql-editor) {
    height: calc(100% - 30px);
  }
</style>
