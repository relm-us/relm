<script lang="ts">
  import type { Entity } from "~/ecs/base";

  import { fade } from "svelte/transition";
  import { Vector3 } from "three";

  import FaExternalLinkAlt from "svelte-icons/fa/FaExternalLinkAlt.svelte";

  import { worldManager } from "~/world";
  import { AVATAR_POINTER_TAP_MAX_DISTANCE } from "~/config/constants";
  import { assetUrl } from "~/config/assetUrl";
  import { cleanLink } from "~/utils/cleanLink";

  import { Asset, Transform } from "~/ecs/plugins/core";

  import { worldUIMode } from "~/stores/worldUIMode";
  import { showCenterButtons } from "~/stores/showCenterButtons";
  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";

  import FullwindowClose from "~/ui/lib/FullwindowClose.svelte";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";
  export let caption: string;
  export let captionUrl: string;
  export let captionBg: string;
  export let visible: boolean;
  export let entity: Entity;

  let fullwindow = false;

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
  }

  function onMouseDown(event) {
    // Prevent click-thru to world, where Draggable might get activated
    if ($worldUIMode === "play") event.stopPropagation();
  }

  $: if ($worldUIMode === "build") {
    fullwindow = false;
  }

  // ignore other props
  $$props;
</script>

{#if visible}
  {#if fullwindow}
    <FullwindowClose on:close={deactivateFullwindow}>
      <r-full-display transition:fade>
        <r-full-wrapper>
          <r-full-image>
            <img class="contain" src={assetUrl(asset.url)} alt={asset.name} />
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

  <!-- Always show image in its Css3d container -->
  <r-image>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
      class:cover={fit === "COVER"}
      class:contain={fit === "CONTAIN"}
      src={assetUrl(asset.url)}
      alt={asset.name === "" ? "HD Image" : asset.name}
      on:pointerdown={activateFullwindow}
      on:mousedown|preventDefault={onMouseDown}
    />
  </r-image>
{/if}

<style>
  r-image img {
    width: 100%;
    height: 100%;

    /* For `alt` text */
    text-align: center;
  }

  r-image img::before {
    /* For `alt` text */
    line-height: 3em;
    background: white;
    color: black;
    font-size: 28px;
  }

  img.cover {
    object-fit: cover;
  }

  img.contain {
    object-fit: contain;
  }

  r-full-display {
    display: flex;
    justify-content: center;
    height: 100%;

    /* allow clicks to go through to fullwindow */
    pointer-events: none;
  }

  r-full-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 32px;
  }

  r-full-image {
    display: flex;
  }

  @media (min-aspect-ratio: 1) {
    r-full-image {
      height: 100%;
    }
  }
  @media (max-aspect-ratio: 1) {
    r-full-image {
      width: 100%;
    }
  }

  r-full-image img {
    width: 100%;
    height: 100%;

    pointer-events: all;
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
</style>
