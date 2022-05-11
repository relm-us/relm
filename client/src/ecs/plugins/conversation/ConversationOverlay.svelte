<script lang="ts">
  import { onMount } from "svelte";
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";

  import { cleanHtml } from "~/utils/cleanHtml";
  import { hasAncestor } from "~/utils/hasAncestor";

  import { assetUrl } from "~/config/assetUrl";
  import { showCenterButtons } from "~/stores/showCenterButtons";

  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let title;
  export let image;
  export let content;
  export let visible;

  export let onCancel;

  const SLIDE_START_POS = 200,
    SLIDE_SPEED = 15;

  let width;
  let el;
  let slideY = SLIDE_START_POS;
  let sectionIndex = 0;
  let sections = [];

  $: $showCenterButtons = !visible;
  $: if (visible) slideY = SLIDE_START_POS;

  $: divideSections(content);

  function divideSections(text) {
    sections = text.split("---");
    sectionIndex = 0;
  }

  function onClick(event) {
    if (hasAncestor(event.target, el)) {
      readNextSection();
    } else {
      onCancel();
    }
  }

  function readNextSection() {
    if (sections.length > 1 && sectionIndex < sections.length - 1) {
      sectionIndex = sectionIndex + 1;
    } else {
      onCancel();
    }
  }

  onMount(() => {
    slideY = SLIDE_START_POS;
    let animate = true;

    const slideAnimate = () => {
      if (animate) {
        slideY -= SLIDE_SPEED;
        if (slideY < 0) slideY = 0;
        requestAnimationFrame(slideAnimate);
      }
    };
    slideAnimate();

    const resize = () => (width = window.innerWidth);
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      $showCenterButtons = true;
      animate = false;
    };
  });

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <Fullwindow zIndex={3} on:click={onClick}>
    <r-conversation bind:this={el} style="transform:translateY({slideY}px)">
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
            <r-content>{@html cleanHtml(sections[sectionIndex])}</r-content>
            {#if sections.length > 1 && sectionIndex < sections.length - 1}
              <r-more-content>
                <icon><IoIosArrowDown /></icon>
              </r-more-content>
            {/if}
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
            <r-content>{@html cleanHtml(sections[sectionIndex])}</r-content>
            {#if sections.length > 1 && sectionIndex < sections.length - 1}
              <r-more-content>
                <icon><IoIosArrowDown /></icon>
              </r-more-content>
            {/if}
          </r-dialog>
        {/if}
      </r-container>
    </r-conversation>
  </Fullwindow>
{/if}

<style>
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
  }
  r-name span {
    padding: 4px 12px;
    background-color: black;
    border-radius: 10px;
  }
  r-content {
    margin-top: 4px;
    margin-left: 12px;
  }
  r-more-content {
    text-align: center;
    align-self: center;
    margin-top: -2px; /* half of icon height */
    margin-bottom: -22px; /* half of icon height */
  }
  icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>
