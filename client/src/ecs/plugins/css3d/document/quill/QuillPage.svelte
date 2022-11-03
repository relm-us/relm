<script lang="ts">
  import { Color } from "three";
  import { tick, onMount, createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  import { config } from "~/config";

  import { fontSizes, quillBind, quillInit, type Quill } from "./quillInit";
  import QuillToolbar from "./QuillToolbar.svelte";

  export let docId: string;
  export let bgColor: string;
  export let placeholder: string;
  export let readOnly: boolean = false;
  export let cursors: boolean = false;
  export let centered: boolean = false;
  export let showToolbar: boolean = false;
  export let editor: Quill = null;
  export let emptyFormat: Record<string, string> = {};
  export let toolbar = null;
  export let autoSizeFont = false;

  const dispatch = createEventDispatcher();

  let wrapper;
  let container;
  let bounds;

  let bindingKey = 0;
  let quillUnbind;
  let resizeObserver: ResizeObserver;

  function bind(docId, toolbar) {
    editor = quillInit(container, toolbar, {
      readOnly,
      cursors,
      bounds,
      emptyFormat,
      placeholder,
    });

    quillUnbind = quillBind(docId, editor);
  }

  function unbind() {
    quillUnbind?.();
    bindingKey++;
  }

  function getCurrentFontSize() {
    let format;
    try {
      format = editor.getFormat();
    } catch {}
    return format?.size || emptyFormat?.size || "12px";
  }

  function nextSmallerSize(size) {
    let i = fontSizes.findIndex((fs) => fs === size);
    if (i > 0) return fontSizes[i - 1];
    else return fontSizes[0];
  }

  async function rebind(docId, showToolbar) {
    unbind();
    await tick();
    if (showToolbar && !toolbar) {
      console.warn("toolbar element missing", docId);
    }
    bind(docId, showToolbar && toolbar ? toolbar : false);

    if (autoSizeFont) {
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => {
        // Oddly, `editor.getFormat()` grabs focus, so make sure we already have focus before
        // proceeding, or else this Document will grab focus from the participant
        if (!editor.hasFocus()) return;

        const size = getCurrentFontSize();
        if (isOverflown(container?.firstChild)) {
          editor.formatText(0, editor.getLength(), {
            size: nextSmallerSize(size),
          });
        } else {
          // TODO: Find a way to "grow" text without subsequently (and spastically) shrinking it again
        }
      });
      resizeObserver.observe(container.firstChild);
    }
  }

  function isOverflown(element) {
    if (!element) return null;
    return element.scrollHeight > element.clientHeight;
  }

  // We wait until the container exists, and rebind whenever docId or showToolbar changes
  $: if (container) rebind(docId, showToolbar);

  let bgColorDark;
  $: bgColorDark = "#" + new Color(bgColor).multiplyScalar(0.8).getHexString();

  function filterClick(event) {
    if (event.target === wrapper) {
      dispatch("pageclick", event);
    }
  }

  let styles = "";
  $: if (emptyFormat)
    for (let [key, value] of Object.entries(emptyFormat)) {
      styles += `--${key}: ${value};`;
    }

  onMount(() => {
    // Clean Quill binding up after svelte component is unmounted
    return unbind;
  });

  // ignore warning about missing props
  $$props;
</script>

{#if showToolbar}
  <!-- The toolbar cannot be re-used during a call to `quillBind`, therefore we force re-build -->
  {#key bindingKey}
    <r-toolbar-wrapper transition:fly={{ y: -50 }}>
      <QuillToolbar bind:toolbar />
    </r-toolbar-wrapper>
  {/key}
{/if}

<!-- svelte-ignore a11y-click-events-have-key-events -->
<r-document-wrapper
  bind:this={wrapper}
  style="--bg-color: {bgColor}; --bg-color-dark: {bgColorDark}; {styles}"
  translate="no"
  class:centered
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
  r-document-wrapper :global(.ql-container) {
    font-family: var(--font);
    font-size: var(--size);
    text-align: var(--align);
    color: var(--color);
  }
  r-document-wrapper :global(.ql-toolbar) {
    border-color: var(--bg-color-dark, #ccc) !important;
  }

  r-document-wrapper.centered {
    justify-content: center;
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
