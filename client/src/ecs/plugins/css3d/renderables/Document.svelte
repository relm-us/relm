<script lang="ts">
  import { onMount } from "svelte";
  import { QuillBinding } from "y-quill";
  import Quill from "quill";

  // TODO: Can we find away around this transform issue? https://github.com/reedsy/quill-cursors/issues/59
  //       Possibly need to walk ancestors and "untransform"? http://jsfiddle.net/YLCd8/2/
  // import QuillCursors from "quill-cursors";

  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";

  // Quill.register("modules/cursors", QuillCursors);

  export let docId: string;
  export let editable: boolean;
  export let visible: boolean;

  let editor, container, toolbar, bounds;

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

  $: if (editor) {
    editor.enable(editable);
  }

  onMount(() => {
    editor = new Quill(container, {
      modules: {
        // cursors: true,
        toolbar,
      },
      placeholder: "Start collaborating...",
      theme: "snow", // or 'bubble'
      bounds,
    });

    editor.enable(editable);

    const interval = setInterval(() => {
      if (worldManager.worldDoc) {
        new QuillBinding(
          worldManager.worldDoc.ydoc.getText(docId),
          editor,
          worldManager.worldDoc.provider.awareness
        );
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  });

  // ignore warning about missing props
  $$props;
</script>

<r-document
  data-pointer-interact={$worldUIMode === "play" ? "1" : undefined}
  class:visible={visible || $worldUIMode === "build"}
>
  <div id="toolbar" bind:this={toolbar}>
    <div class="ql-formats">
      <select class="ql-header">
        <option value="1" />
        <option value="2" />
        <!-- Note a missing, thus falsy value, is used to reset to default -->
        <option selected />
      </select>
      <select class="ql-align">
        <option value="" />
        <option value="center" />
        <option value="right" />
      </select>
      <button class="ql-link" />
    </div>
    <div class="ql-formats">
      <button class="ql-bold" />
      <button class="ql-italic" />
      <button class="ql-underline" />
      <button class="ql-strike" />
    </div>
    <div class="ql-formats">
      <button class="ql-image" />
      <button class="ql-blockquote" />
    </div>
    <div class="ql-formats">
      <select class="ql-color">
        {#each colors as color}
          <option value={color} />
        {/each}
      </select>
      <select class="ql-background">
        {#each colors as color}
          <option value={color} />
        {/each}
      </select>
    </div>
  </div>
  <div bind:this={container} />
  <div bind:this={bounds} class="bounds" />
  {#if $worldUIMode === "build"}
    <r-overlay />
  {/if}
</r-document>

<style>
  r-document {
    display: none;
    flex-direction: column;
    background-color: white;
    height: 100%;
  }
  r-document.visible {
    display: flex;
  }

  r-document :global(.ql-editor) {
    padding: 12px 15px 4px 15px;
  }

  .bounds {
    position: absolute;
    left: 75px;
    right: 0px;
  }

  r-overlay {
    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    background-color: white;
  }
</style>
