<script lang="ts">
  import { Color } from "three";
  import { onMount, afterUpdate, createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  import { quillBind, quillInit } from "./quillInit";
  import QuillToolbar from "./QuillToolbar.svelte";
  import { config } from "~/config";

  export let docId: string;
  export let bgColor: string;
  export let readOnly: boolean = false;
  export let cursors: boolean = false;
  export let showToolbar: boolean = false;
  export let editor = null;
  export let toolbar = null;

  const dispatch = createEventDispatcher();

  let wrapper;
  let container;
  let bounds;

  let boundDocId = null;
  let quillUnbind;

  function bind() {
    quillUnbind = quillBind(docId, editor);
    boundDocId = docId;
  }

  function unbind() {
    quillUnbind?.();
    boundDocId = null;
  }

  onMount(() => {
    console.log("mount QuillPage", docId);
    editor = quillInit(container, showToolbar && toolbar ? toolbar : false, {
      readOnly,
      cursors,
      bounds,
    });

    // Initial Quill binding to Y.Text at `docId`
    bind();

    return () => {
      // Clean Quill binding up after svelte component is unmounted
      unbind();
    };
  });

  afterUpdate(() => {
    if (docId !== boundDocId) {
      // `docId` has changed
      unbind();
      bind();
    }
  });

  let bgColorDark;
  $: bgColorDark = "#" + new Color(bgColor).multiplyScalar(0.8).getHexString();

  function filterClick(event) {
    if (event.target === wrapper) dispatch("pageclick", event);
  }

  // ignore warning about missing props
  $$props;
</script>

{#if editor && showToolbar}
  <r-toolbar-wrapper transition:fly={{ y: -50 }}>
    <QuillToolbar bind:toolbar />
  </r-toolbar-wrapper>
{/if}

<r-document-wrapper
  bind:this={wrapper}
  style="--bg-color: {bgColor}; --bg-color-dark: {bgColorDark}"
  on:click={filterClick}
>
  <div bind:this={container} />
  <div bind:this={bounds} class="bounds" />
  <slot />
</r-document-wrapper>

<link
  rel="stylesheet"
  href="{config.fontsUrl}?family=Quicksand|Cormorant+Garamond|Oswald|Square+Peg"
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

  :global(.ql-cursor-name) {
    margin-top: 6px !important;
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

  /* Provide outer bounds for quill tooltip window */
  .bounds {
    position: relative;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
</style>
