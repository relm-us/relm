<script lang="ts">
  import { Vector2 } from "three";

  import { Entity } from "~/ecs/base";
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";

  import QuillOverlay from "../document/quill/QuillOverlay.svelte";
  import QuillPage from "./quill/QuillPage.svelte";
  import { Document } from "./Document";
  import DocumentFullwindow from "./DocumentFullwindow.svelte";

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

  // We need to keep track of the docId at the moment the participant clicks to make
  // it "full window" because the full window view should not be affected by others
  // changing the docId with the next/back buttons.
  let fullwindowDocId;
  let fullwindowMode = false;

  $: if (editor) editor.enable(editable && fullwindowMode);

  let page = -1;
  $: pageList.length, (page = pageList.findIndex((pageId) => docId === pageId));

  let showPrev = false;
  $: showPrev = page >= 1;

  let showNext = false;
  $: showNext = page >= 0 && page < pageList.length - 1;

  const activate = () => {
    fullwindowDocId = docId;
    fullwindowMode = true;
  };

  const deactivate = () => {
    fullwindowDocId = null;
    fullwindowMode = false;
  };

  function setDocId(newDocId) {
    const spec: Document = entity.get(Document);

    spec.docId = newDocId;
    spec.modified();

    worldManager.worldDoc.syncFrom(entity);

    docId = newDocId;
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

{#if fullwindowMode}
  <DocumentFullwindow
    on:close={deactivate}
    docId={fullwindowDocId}
    {editable}
    {bgColor}
    {kind}
    {radius}
    {size}
  />
{/if}
