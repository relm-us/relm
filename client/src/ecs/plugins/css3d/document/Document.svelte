<script lang="ts">
  import { Vector2 } from "three";
  import { slide } from "svelte/transition";

  import { Entity } from "~/ecs/base";
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  import QuillOverlay from "../document/quill/QuillOverlay.svelte";
  import QuillPage from "./quill/QuillPage.svelte";
  import { Document } from "./Document";

  export let docId: string;
  export let bgColor: string;
  export let editable: boolean;
  export let visible: boolean;
  export let kind: string;
  export let radius: number;
  export let size: Vector2;
  export let pageList: string[];
  export let entity: Entity;

  let editor = null;
  let toolbar = null;
  let bigscreen = false;

  $: if (editor) editor.enable(editable && bigscreen);

  let page = -1;
  $: pageList.length, (page = pageList.findIndex((pageId) => docId === pageId));

  let showPrev = false;
  $: showPrev = page >= 1;

  let showNext = false;
  $: showNext = page >= 0 && page < pageList.length - 1;

  const activate = () => (bigscreen = true);
  const deactivate = () => (bigscreen = false);

  function setDocId(newDocId) {
    const spec: Document = entity.get(Document);

    spec.docId = newDocId;
    spec.modified();

    worldManager.worldDoc.syncFrom(entity);
  }

  function prevPage() {
    page = page - 1;
    setDocId(pageList[page]);
  }

  function nextPage() {
    page = page + 1;
    setDocId(pageList[page]);
  }

  // ignore warning about missing props
  $$props;
</script>

{#if bigscreen}
  <Fullwindow on:close={deactivate}>
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
      <QuillOverlay
        cloudy={false}
        {showPrev}
        {showNext}
        on:click={activate}
        on:prev={prevPage}
        on:next={nextPage}
      />
    {:else if $worldUIMode === "build"}
      <QuillOverlay cloudy={true} />
    {/if}
  </QuillPage>
{/if}

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

  .rounded {
    border-radius: var(--radius);
    overflow: hidden;
  }

  .circle {
    border-radius: 100%;
    overflow: hidden;
  }
</style>
