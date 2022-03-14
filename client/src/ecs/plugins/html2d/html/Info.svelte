<script>
  import IoIosLink from "svelte-icons/io/IoIosLink.svelte";
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  import IoIosArrowForward from "svelte-icons/io/IoIosArrowForward.svelte";
  import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";
  import debounce from "lodash/debounce";

  import { cleanHtml } from "~/utils/cleanHtml";

  import { worldManager } from "~/world";
  import CircleButton from "~/ui/lib/CircleButton";

  import { Html2d } from "../components";
  import { hasAncestor } from "~/utils/hasAncestor";

  export let title;
  export let link;
  export let content;
  export let editable;
  export let visible;

  // The entity that this Label is attached to
  export let entity;

  let containerEl;
  let titleEl;
  let linkEl;
  let contentEl;
  let editing = false;
  let expanded = false;

  function toggleEditing() {
    editing = !editing;

    if (!editing) {
      saveText();
    }
  }

  function cancelEditing(event) {
    if (!hasAncestor(event.target, containerEl)) {
      editing = false;
    }
  }

  function toggleExpanded() {
    expanded = !expanded;
  }

  function saveText() {
    const component = entity.get(Html2d);

    title = component.title = titleEl.value;
    link = component.link = linkEl.value;
    content = component.content = contentEl.innerHTML;

    // Broadcast changes
    worldManager.worldDoc.syncFrom(entity);
  }

  function notEmpty(link) {
    return link && link.length > 0;
  }

  const onKeydown = debounce((event) => {
    saveText();
    if (event.key === "Escape") {
      event.preventDefault();
      editing = false;
    }
  }, 1000);

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <r-container bind:this={containerEl}>
    <r-info>
      {#if editing}
        <r-row>
          <!-- svelte-ignore a11y-positive-tabindex -->
          <input
            bind:this={titleEl}
            on:keydown={onKeydown}
            tabIndex="1"
            type="text"
            value={title ? title : ""}
          />
          <CircleButton size={24} margin={0} on:click={toggleEditing}>
            <IoMdCreate />
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
          <CircleButton size={24}>
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
      {:else}
        <r-row on:click={toggleExpanded}>
          {#if notEmpty(content)}
            <icon>
              {#if expanded}
                <IoIosArrowDown />
              {:else}
                <IoIosArrowForward />
              {/if}
            </icon>
          {/if}
          {#if notEmpty(title) && notEmpty(link)}
            <a
              class="row-content"
              href={link}
              target="_blank"
              on:click|stopPropagation>{title}</a
            >
          {:else if notEmpty(title)}
            <div class="row-content interactive">
              {title}
            </div>
          {:else if editable}
            <div
              class="row-content"
              style="text-align: center; cursor: pointer"
              on:click={toggleEditing}
            >
              Add Info
            </div>
          {/if}

          {#if editable}
            <r-button-margin>
              <CircleButton size={24} margin={0} on:click={toggleEditing}>
                <IoMdCreate />
              </CircleButton>
            </r-button-margin>
          {/if}
        </r-row>

        {#if expanded}
          <r-row style="margin-top: 8px">
            <r-body bind:this={contentEl}>
              {@html cleanHtml(content)}
            </r-body>
          </r-row>
        {/if}
      {/if}
    </r-info>
  </r-container>
{/if}

<svelte:window on:mouseup={cancelEditing} />

<style>
  r-container {
    position: relative;
    display: flex;
    height: 48px;
    pointer-events: auto;
  }
  r-info {
    display: flex;
    flex-direction: column;
    position: absolute;
    transform: translate(-50%, 0);

    min-width: 100px;
    max-width: 280px;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));

    font-size: 14pt;

    border-radius: 10px;
    padding: 8px;
  }
  r-row {
    display: flex;
    align-items: center;
  }
  r-row.margin-bottom {
    margin-bottom: 5px;
  }
  r-button-margin {
    margin-left: 18px;
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
    background-color: var(--fg-color, rgba(221, 221, 221, 0.9));
    color: #222;
    border: 0;
    border-radius: 3px;
    padding-left: 4px;
  }
  r-body {
    flex-grow: 1;
    min-height: 48px;
    font-size: 10pt;
    padding: 4px;
    word-break: break-word;
  }
  .row-content {
    align-self: center;
    text-align: center;
    color: var(--fg-color, rgba(221, 221, 221, 0.9));
    flex-grow: 1;
    padding-left: 2px;
    padding-right: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  icon {
    display: block;
    width: 24px;
    height: 24px;
    color: var(--fg-color, rgba(221, 221, 221, 0.9));
  }
</style>
