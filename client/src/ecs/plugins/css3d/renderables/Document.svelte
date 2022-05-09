<script lang="ts">
  import { Color } from "three";
  import { onMount } from "svelte";
  import { QuillBinding } from "y-quill";
  import Quill from "quill";

  // TODO: Can we find away around this transform issue? https://github.com/reedsy/quill-cursors/issues/59
  //       Possibly need to walk ancestors and "untransform"? http://jsfiddle.net/YLCd8/2/
  // import QuillCursors from "quill-cursors";

  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";

  // Quill.register("modules/cursors", QuillCursors);

  let Font = Quill.import("formats/font");
  // We do not add Sans Serif since it is the default
  Font.whitelist = ["quicksand", "garamond", "oswald", "squarepeg"];
  Quill.register(Font, true);

  // prettier-ignore
  const fontSizeArr = [
    "12px", "16px", "20px", "24px", "32px",
    "48px", "80px", "100px", "150px"
  ];
  var Size = Quill.import("attributors/style/size");
  Size.whitelist = fontSizeArr;
  Quill.register(Size, true);

  export let docId: string;
  export let bgColor: string;
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

  let bgColorDark;
  $: bgColorDark = "#" + new Color(bgColor).multiplyScalar(0.8).getHexString();

  // ignore warning about missing props
  $$props;
</script>

<r-document
  data-pointer-interact={$worldUIMode === "play" ? "1" : undefined}
  class:visible={visible || $worldUIMode === "build"}
  style="--bg-color: {bgColor}; --bg-color-dark: {bgColorDark}"
>
  <div class="toolbar" bind:this={toolbar}>
    <div class="ql-formats">
      <button class="ql-bold" />
      <button class="ql-italic" />
      <button class="ql-underline" />
    </div>

    <div class="ql-formats">
      <select class="ql-font">
        <option selected value="">Sans Serif</option>
        <option value="quicksand">Quicksand</option>
        <option value="garamond">Garamond</option>
        <option value="oswald">Oswald</option>
        <option value="squarepeg">Square Peg</option>
      </select>

      <select class="ql-size">
        {#each fontSizeArr as size}
          <option value={size}>{size.replace("px", "")}</option>
        {/each}
      </select>

      <select class="ql-align">
        <option value="" />
        <option value="center" />
        <option value="right" />
      </select>
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
    <div class="ql-formats">
      <button class="ql-link" />
      <button class="ql-image" />
    </div>
    <div class="ql-formats">
      <button class="ql-strike" />
      <button class="ql-blockquote" />
      <button class="ql-clean" />
    </div>
  </div>
  <div bind:this={container} />
  <div bind:this={bounds} class="bounds" />
  {#if $worldUIMode === "build"}
    <r-overlay />
  {/if}
</r-document>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Quicksand|Cormorant+Garamond|Oswald|Square+Peg"
/>

<style>
  r-document {
    display: none;
    flex-direction: column;
    background-color: var(--bg-color, white);
    height: 100%;
  }
  r-document.visible {
    display: flex;
  }

  r-document :global(.ql-toolbar) {
    border-color: var(--bg-color-dark, #ccc) !important;
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

  .toolbar {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .toolbar :global(.ql-formats) {
    display: flex;
  }

  .toolbar :global(.ql-font span[data-label="Sans Serif"]::before) {
    font-family: Helvetica, Arial, sans-serif;
  }

  .toolbar :global(.ql-font span[data-label="Quicksand"]::before),
  :global(.ql-font-quicksand) {
    font-family: "Quicksand";
  }

  .toolbar :global(.ql-font span[data-label="Garamond"]::before),
  :global(.ql-font-garamond) {
    font-family: "Cormorant Garamond";
  }

  .toolbar :global(.ql-font span[data-label="Oswald"]::before),
  :global(.ql-font-oswald) {
    font-family: "Oswald";
  }

  .toolbar :global(.ql-font span[data-label="Square Peg"]::before),
  :global(.ql-font-squarepeg) {
    font-family: "Square Peg";
  }
</style>
