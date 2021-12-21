<script>
  import { Vector2, Vector3 } from "three";
  import { cleanHtml } from "~/utils/cleanHtml";

  import { Html2d } from "../components";
  import { Relm } from "~/stores/Relm";
  import CircleButton from "~/ui/lib/CircleButton";
  // import { mode } from "~/stores/mode";
  // import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";

  import IoIosLink from "svelte-icons/io/IoIosLink.svelte";
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";

  export let title;
  export let link;
  export let content;
  // export let editable;
  export let visible;

  // The entity that this Label is attached to
  export let entity;

  let titleEl;
  let linkEl;
  let contentEl;
  let editing = false;

  function toggleEditing() {
    editing = !editing;

    if (!editing) {
      doneEditing();
    }
  }

  function doneEditing() {
    const component = entity.get(Html2d);

    title = component.title = titleEl.value;
    link = component.link = linkEl.value;
    content = component.content = contentEl.innerHTML;

    // Broadcast changes
    $Relm.wdoc.syncFrom(entity);

    editing = false;
  }

  function openLink() {
    window.open(link, "_blank");
  }

  function hasLink(link) {
    return link && link.length > 0;
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      doneEditing();
    }
  }

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <r-container>
    <r-info>
      {#if !editing}
        <r-row>
          {#if title && hasLink(link)}
            <a class="row-content" href={link} target="_blank">{title}</a>
          {:else if title}
            <div class="row-content interactive">
              {title}
            </div>
          {:else}
            <div
              class="row-content"
              style="text-align: center; cursor: pointer"
              on:click={toggleEditing}
            >
              Add Info
            </div>
          {/if}
          <CircleButton size={24} on:click={toggleEditing}>
            <IoIosArrowDown />
          </CircleButton>
        </r-row>
      {:else}
        <r-row class="margin-bottom">
          <!-- svelte-ignore a11y-positive-tabindex -->
          <input
            bind:this={titleEl}
            on:keydown={onKeydown}
            tabIndex="1"
            type="text"
            value={title ? title : ""}
          />
          <CircleButton size={24} on:click={toggleEditing}>
            <IoIosArrowDown />
          </CircleButton>
        </r-row>
        <r-row class="margin-bottom">
          <!-- svelte-ignore a11y-positive-tabindex -->
          <input
            bind:this={linkEl}
            on:keydown={onKeydown}
            tabIndex="2"
            type="text"
            value={link ? link : ""}
          />
          <CircleButton size={24} on:click={openLink}>
            <IoIosLink />
          </CircleButton>
        </r-row>
        <!-- svelte-ignore a11y-positive-tabindex -->
        <r-body
          bind:this={contentEl}
          on:keydown={onKeydown}
          tabIndex="3"
          contenteditable={true}
        >
          {@html cleanHtml(content)}
        </r-body>
      {/if}
    </r-info>
  </r-container>
{/if}

<!-- <svelte:window on:mouseup={onMouseup} /> -->
<style>
  r-container {
    position: relative;
    display: flex;
    height: 48px;
  }
  r-info {
    display: flex;
    flex-direction: column;
    position: absolute;
    transform: translate(-50%, 0);

    min-width: 100px;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));

    font-size: 14pt;

    border-radius: 10px;
    padding: 8px;
  }
  r-row {
    display: flex;
  }
  r-row.margin-bottom {
    margin-bottom: 8px;
  }
  r-row a,
  r-row input {
    display: block;
    flex-grow: 1;
  }
  r-row input {
    margin-right: 8px;
  }
  r-body,
  r-row input {
    background-color: var(--fg-color, #dddddd);
    color: #222;
    border: 0;
    border-radius: 3px;
    padding-left: 4px;
  }
  r-body {
    min-height: 48px;
    font-size: 10pt;
    padding: 4px;
  }
  .row-content {
    align-self: center;
    color: var(--fg-color, #dddddd);
    flex-grow: 1;
    padding-left: 2px;
    padding-right: 4px;
    white-space: nowrap;
  }
</style>
