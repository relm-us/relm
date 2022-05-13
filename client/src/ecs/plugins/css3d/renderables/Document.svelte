<script lang="ts">
  import { Vector2 } from "three";
  import { slide } from "svelte/transition";

  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { hasAncestor } from "~/utils/hasAncestor";

  import QuillOverlay from "./QuillOverlay.svelte";
  import QuillPage from "./QuillPage.svelte";

  export let docId: string;
  export let bgColor: string;
  export let editable: boolean;
  export let visible: boolean;
  export let kind: string;
  export let radius: number;
  export let size: Vector2;

  let editor = null;
  let toolbar = null;
  let pageEl = null;
  let bigscreen = false;

  $: if (editor) editor.enable(editable && bigscreen);

  const activate = () => (bigscreen = true);
  const deactivate = () => (bigscreen = false);

  function onClick(event) {
    if (
      hasAncestor(event.target, pageEl) ||
      hasAncestor(event.target, toolbar)
    ) {
      editor.focus();
    } else {
      deactivate();
    }
  }

  // ignore warning about missing props
  $$props;
</script>

{#if bigscreen}
  <Fullwindow on:click={onClick}>
    <r-centered>
      <r-page-margin
        transition:slide
        bind:this={pageEl}
        style="--x:{size.x}px;--y:{size.y}px;--radius:{radius * 150}px"
        class:rounded={kind === "ROUNDED"}
        class:circle={kind === "CIRCLE"}
      >
        <QuillPage
          {docId}
          {bgColor}
          bind:editor
          bind:toolbar
          readOnly={!editable}
          cursors={true}
          showToolbar={editable}
        />
      </r-page-margin>
    </r-centered>
  </Fullwindow>
{/if}

{#if visible}
  <QuillPage
    {docId}
    {bgColor}
    bind:editor
    readOnly={true}
    cursors={false}
    showToolbar={false}
  >
    {#if $worldUIMode === "play"}
      <QuillOverlay cloudy={false} on:click={activate} />
    {:else if $worldUIMode === "build"}
      <QuillOverlay cloudy={true} />
    {/if}
  </QuillPage>
{/if}

<style>
  r-centered {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 12px;
  }

  r-page-margin {
    display: block;
    width: var(--x);
    height: var(--y);
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.5);
  }

  .rounded {
    border-radius: var(--radius);
    overflow: hidden;
  }

  .circle {
    border-radius: 100%;
    overflow: hidden;
  }
</style>
