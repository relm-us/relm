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
    editor = quillInit(container, showToolbar ? toolbar : false, readOnly);
    return quillBind(docId, editor);
  });

  let bgColorDark;
  $: bgColorDark = "#" + new Color(bgColor).multiplyScalar(0.8).getHexString();

  // ignore warning about missing props
  $$props;
</script>

{#if editor && showToolbar}
  <QuillToolbar {editor} bind:toolbar />
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
</style>
