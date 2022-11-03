<script lang="ts">
  import { Vector2 } from "three";
  import { slide } from "svelte/transition";

  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  import QuillPage from "./quill/QuillPage.svelte";

  export let docId: string;
  export let placeholder: string;
  export let bgColor: string;
  export let editable: boolean;
  export let kind: string;
  export let radius: number;
  export let size: Vector2;

  let editor = null;
  let toolbar = null;

  $: if (editor) editor.enable(editable);
</script>

<Fullwindow on:close>
  <r-centered>
    <div style="height:{editable ? 64 : 0}px" />

    <r-page-margin
      transition:slide
      style="--x:{size.x}px;--y:{size.y}px;--radius:{radius * 150}px"
      class:rounded={kind === "ROUNDED"}
      class:circle={kind === "CIRCLE"}
    >
      <QuillPage
        {docId}
        {placeholder}
        {bgColor}
        bind:editor
        bind:toolbar
        readOnly={!editable}
        cursors={true}
        showToolbar={editable}
        on:pageclick={() => editor.focus()}
      />
    </r-page-margin>
  </r-centered>
</Fullwindow>

<style>
  r-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    height: 100%;
  }

  r-page-margin {
    display: block;
    pointer-events: all;
    width: var(--x);
    height: var(--y);
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.5);
  }

  r-page-margin.rounded {
    border-radius: var(--radius);
    overflow: hidden;
  }

  r-page-margin.circle {
    border-radius: 100%;
    overflow: hidden;
  }
</style>
