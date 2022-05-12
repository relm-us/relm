<script lang="ts">
  import { Color } from "three";
  import { onMount } from "svelte";

  import { quillBind, quillInit } from "./quillInit";
  import QuillToolbar from "./QuillToolbar.svelte";

  export let docId: string;
  export let bgColor: string;
  export let readOnly: boolean = false;
  export let showToolbar: boolean = false;
  export let editor = null;
  export let toolbar = null;

  let container;

  onMount(() => {
    editor = quillInit(
      container,
      showToolbar && toolbar ? toolbar : false,
      readOnly
    );
    return quillBind(docId, editor);
  });

  let bgColorDark;
  $: bgColorDark = "#" + new Color(bgColor).multiplyScalar(0.8).getHexString();

  // ignore warning about missing props
  $$props;
</script>

{#if editor && showToolbar}
  <r-toolbar-wrapper>
    <QuillToolbar bind:toolbar />
  </r-toolbar-wrapper>
{/if}

<r-document-wrapper
  style="--bg-color: {bgColor}; --bg-color-dark: {bgColorDark}"
  on:click
>
  <div bind:this={container} />
  <slot />
</r-document-wrapper>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Quicksand|Cormorant+Garamond|Oswald|Square+Peg"
/>

<style>
  r-document-wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color, white);
    height: 100%;

    overflow-y: auto;
  }
  r-document-wrapper :global(.ql-toolbar) {
    border-color: var(--bg-color-dark, #ccc) !important;
  }
  r-document-wrapper :global(.ql-editor) {
    padding: 12px 15px 4px 15px;
  }

  r-toolbar-wrapper {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 3;
    top: 10px;
    left: 15px;
    right: 15px;
  }

  :global(.ql-font-quicksand) {
    font-family: "Quicksand";
  }

  :global(.ql-font-garamond) {
    font-family: "Cormorant Garamond";
  }

  :global(.ql-font-oswald) {
    font-family: "Oswald";
  }

  :global(.ql-font-squarepeg) {
    font-family: "Square Peg";
  }
</style>
