<script lang="ts">
  import type { Entity } from "~/ecs/base";

  import { fade, fly } from "svelte/transition";
  import { Vector2, Vector3 } from "three";

  import FaExternalLinkAlt from "svelte-icons/fa/FaExternalLinkAlt.svelte";
  import FaArrowAltCircleRight from "svelte-icons/fa/FaArrowAltCircleRight.svelte";

  import { worldManager } from "~/world";
  import { AVATAR_POINTER_TAP_MAX_DISTANCE } from "~/config/constants";
  import { assetUrl } from "~/config/assetUrl";
  import { cleanLink } from "~/utils/cleanLink";
  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";

  import { Asset, Transform } from "~/ecs/plugins/core";

  import { worldUIMode } from "~/stores/worldUIMode";
  import { showCenterButtons } from "~/stores/showCenterButtons";

  import FullwindowClose from "~/ui/lib/FullwindowClose.svelte";

  import { Document } from "../components";
  import DocumentFullwindow from "../document/DocumentFullwindow.svelte";
  import Image from "./Image.svelte";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";
  export let caption: string;
  export let captionUrl: string;
  export let captionBg: string;
  export let visible: boolean;
  export let entity: Entity;

  export let clicked: boolean = false;

  $: if (clicked) {
    if (fullwindow) deactivateFullwindow();
    else activateFullwindow();
    clicked = false;
  }

  let fullwindow = false;
  let documentView = false;

  function activateFullwindow() {
    // don't allow activating in build mode
    if ($worldUIMode === "build") return;

    // don't allow activating from accidental drag clicks
    if (pointerStateDelayed === "interactive-drag") return;

    // don't allow activating an image that is too far away from the avatar
    const p1: Vector3 = entity.get(Transform).position;
    const p2: Vector3 = worldManager.participants.local.avatar.position;
    if (p1.distanceTo(p2) > AVATAR_POINTER_TAP_MAX_DISTANCE) return;

    showCenterButtons.set(false);

    fullwindow = true;
  }

  function deactivateFullwindow() {
    showCenterButtons.set(true);

    fullwindow = false;
    documentView = false;
  }

  function showDocumentView() {
    if (entity.has(Document)) documentView = true;
  }

  $: if ($worldUIMode === "build") {
    fullwindow = false;
  }

  function flyOrFade(node, options) {
    if (documentView) {
      return fly(node, options);
    } else {
      return fade(node, options);
    }
  }

  // ignore other props
  $$props;
</script>

{#if documentView}
  <DocumentFullwindow
    on:close={deactivateFullwindow}
    {...entity.get(Document)}
    size={new Vector2(500, 800)}
    flyTransition={true}
  />
{:else if visible}
  {#if fullwindow}
    <FullwindowClose
      on:click={showDocumentView}
      on:close={deactivateFullwindow}
    >
      <r-full-display in:fade={{ duration: 200 }} out:flyOrFade={{ x: -200 }}>
        <r-full-wrapper>
          <r-full-image>
            <Image
              fit="CONTAIN-MAX"
              src={assetUrl(asset.url)}
              alt={asset.name}
            />
            {#if entity.has(Document)}
              <button class="look-inside" on:click={showDocumentView}>
                <FaArrowAltCircleRight />
              </button>
            {/if}
          </r-full-image>
          {#if caption !== ""}
            <r-full-footer>
              <r-caption style="--caption-bg:{captionBg}">
                {#if captionUrl === ""}
                  {caption}
                {:else}
                  <r-link>
                    <r-icon>
                      <FaExternalLinkAlt />
                    </r-icon>
                    <a
                      href={cleanLink(captionUrl)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {caption}
                    </a>
                  </r-link>
                {/if}
              </r-caption>
            </r-full-footer>
          {/if}
        </r-full-wrapper>
      </r-full-display>
    </FullwindowClose>
  {/if}
{/if}

<!-- Always show image in its Css3d container -->
<r-image>
  <Image
    {fit}
    src={assetUrl(asset.url)}
    alt={asset.name === "" ? "HD Image" : asset.name}
    on:click={activateFullwindow}
  />
</r-image>

<style>
  r-full-display {
    display: flex;
    justify-content: center;
    height: 100%;

    /* allow clicks to go through to fullwindow */
    pointer-events: none;
  }

  r-full-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 32px;
  }

  r-full-image {
    display: flex;
    justify-content: center;
    max-width: 100%;
    max-height: 100%;
  }

  r-full-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 0;
    height: 48px;
    margin-top: 8px;

    background: var(--caption-bg);
    border-radius: 8px;
  }

  r-caption {
    font-size: 18px;

    color: var(--foreground-white);
    background: var(--caption-bg);
    border-radius: 8px;
    padding: 12px 16px;

    pointer-events: all;
  }
  r-caption a {
    color: var(--foreground-white);
  }

  r-image {
    position: absolute;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: auto;

    color: black;
    background: white;
  }

  r-link {
    display: flex;
    align-items: center;
  }

  r-icon {
    display: block;
    width: 20px;
    height: 20px;
    padding-right: 6px;

    /* slightly better vertical center, next to text */
    margin-top: 2px;
  }

  button.look-inside {
    border: 0;
    padding: 0;
    background: none;

    position: absolute;
    right: 0;
    bottom: 50%;

    display: block;
    width: 64px;
    height: 64px;

    opacity: 0.8;
    color: white;

    pointer-events: all;
  }
</style>
