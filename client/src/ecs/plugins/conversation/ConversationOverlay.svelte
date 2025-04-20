<script lang="ts">
import { onDestroy } from "svelte"
import { fly } from "svelte/transition"

import { assetUrl } from "~/config/assetUrl"
import { showCenterButtons } from "~/stores/showCenterButtons"

import Portal from "~/ui/lib/Portal.svelte"
import ConversationContent from "./ConversationContent.svelte"
import ConversationMore from "./ConversationMore.svelte"

export let title
export let image
export let content
export let visible

export let onCancel

let width
let el
let sectionIndex = 0
let sections = []

$: $showCenterButtons = !visible

$: divideSections(content)

function divideSections(text) {
  sections = text.split("---")
  sectionIndex = 0
}

function readNextSection() {
  if (sections.length > 1 && sectionIndex < sections.length - 1) {
    sectionIndex = sectionIndex + 1
  } else {
    onCancel()
  }
}

onDestroy(() => ($showCenterButtons = true))

// ignore warning about missing props
$$props
</script>

{#if visible}
  <Portal>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <r-event-overlay on:click={onCancel} />

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <r-conversation
      bind:this={el}
      transition:fly={{ y: 250, duration: 600 }}
      on:click|stopPropagation={readNextSection}
    >
      <r-container class:small={width <= 500}>
        {#if width > 500}
          {#if image.url && image.url !== ""}
            <r-image>
              <img src={assetUrl(image.url)} alt="{title} photo" />
            </r-image>
          {/if}
          <r-dialog>
            <r-name>
              {#if title && title !== ""}
                <span>{title}</span>
              {/if}
            </r-name>

            <ConversationContent {sections} {sectionIndex} />

            <ConversationMore {sections} {sectionIndex} />
          </r-dialog>
        {:else}
          <!-- mobile -->
          <r-row>
            {#if image.url && image.url !== ""}
              <r-image>
                <img src={assetUrl(image.url)} alt="{title} photo" />
              </r-image>
            {/if}
            <r-name>
              {#if title && title !== ""}
                <span>{title}</span>
              {/if}
            </r-name>
          </r-row>
          <r-dialog>
            <ConversationContent {sections} {sectionIndex} />

            <ConversationMore {sections} {sectionIndex} />
          </r-dialog>
        {/if}
      </r-container>
    </r-conversation>
  </Portal>
{/if}

<svelte:window bind:innerWidth={width} />

<style>
  r-event-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  r-conversation {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 50%;
    z-index: 4;

    color: var(--foreground-white, rgba(255, 255, 255, 1));
    background-color: var(--bg-color, rgba(0, 0, 0, 0.6));
  }
  r-container {
    display: flex;
    margin: 20px;
    height: 30vh;
  }

  /* Mobile (small screen) is stacked as a column */
  r-container.small {
    flex-direction: column;
  }
  r-container.small r-image {
    margin-top: -40px;
  }
  r-container.small img {
    width: 80px;
    height: 80px;
  }
  r-container.small r-name {
    margin-left: 15px;
  }
  r-container.small r-dialog {
    margin-left: unset;
  }

  r-image {
    margin-top: -75px;
  }
  r-image img {
    width: 150px;
    height: 150px;
    object-fit: contain;
  }
  r-row {
    display: flex;
    margin-top: -40px;
    margin-bottom: 40px;
  }
  r-dialog {
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    margin-top: -40px; /* name height */
    width: 100%;
  }
  r-name {
    height: 40px;
    align-items: center;
    display: flex;
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
  }
  r-name span {
    padding: 4px 12px;
    background-color: black;
    border-radius: 10px;
  }
</style>
