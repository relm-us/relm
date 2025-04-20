<script lang="ts">
import type { Vector2 } from "three"

import type { Entity } from "~/ecs/base"
import { worldManager } from "~/world"
import { worldUIMode } from "~/stores/worldUIMode"

import QuillOverlay from "../document/quill/QuillOverlay.svelte"
import QuillPage from "./quill/QuillPage.svelte"
import { Document } from "./Document"
import DocumentFullwindow from "./DocumentFullwindow.svelte"
import { HdImage } from "../components"

export let docId: string
export let bgColor: string
export let editable: boolean
export let simpleMode: boolean
export let emptyFormat: Record<string, string> | null
export let placeholder: string

export let visible: boolean
export let kind: string
export let radius: number
export let size: Vector2
export let pageList: string[]
export let entity: Entity

export let clicked: boolean = false

$: if (clicked) {
  if (fullwindow) deactivateFullwindow()
  else activateFullwindow()
  clicked = false
}

let editor = null

// We need to keep track of the docId at the moment the participant clicks to make
// it "full window" because the full window view should not be affected by others
// changing the docId with the next/back buttons.
let fullwindowDocId
let fullwindow = false

$: if (editor) editor.enable(editable && fullwindow)

let page = -1
$: pageList.length, (page = pageList.findIndex((pageId) => docId === pageId))

let showPrev = false
$: showPrev = page >= 1

let showNext = false
$: showNext = page >= 0 && page < pageList.length - 1

const activateFullwindow = () => {
  fullwindowDocId = docId
  fullwindow = true
}

const deactivateFullwindow = () => {
  fullwindowDocId = null
  fullwindow = false
}

function setDocId(newDocId) {
  const spec: Document = entity.get(Document)

  spec.docId = newDocId
  spec.modified()

  worldManager.worldDoc.syncFrom(entity)

  docId = newDocId
}

function prevPage() {
  page = page - 1
  setDocId(pageList[page])
}

function nextPage() {
  page = page + 1
  setDocId(pageList[page])
}

$: if (editor && simpleMode) editor.enable(editable)

// ignore warning about missing props
$$props
</script>

{#if visible && !entity.has(HdImage)}
  <QuillPage
    {docId}
    {placeholder}
    {bgColor}
    bind:editor
    readOnly={!simpleMode}
    cursors={simpleMode}
    centered={simpleMode}
    showToolbar={false}
    {emptyFormat}
    autoSizeFont={simpleMode}
    on:pageclick={() => editor.focus()}
  >
    {#if $worldUIMode === "play" && !simpleMode}
      <QuillOverlay
        cloudy={false}
        {showPrev}
        {showNext}
        on:click={activateFullwindow}
        on:prev={prevPage}
        on:next={nextPage}
      />
    {:else if $worldUIMode === "build"}
      <QuillOverlay cloudy={true} />
    {/if}
  </QuillPage>
{/if}

{#if fullwindow}
  <DocumentFullwindow
    on:close={deactivateFullwindow}
    docId={fullwindowDocId}
    {placeholder}
    {editable}
    {bgColor}
    {kind}
    {radius}
    {size}
  />
{/if}
