<script lang="ts">
  import FaMousePointer from "svelte-icons/fa/FaMousePointer.svelte";
  import FaMountain from "svelte-icons/fa/FaMountain.svelte";

  import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";
  import FaCircleNotch from "svelte-icons/fa/FaCircleNotch.svelte";

  import ToolButton from "./ToolButton.svelte";
  import { advancedEdit } from "~/stores/advancedEdit";
  import { dragAction } from "~/stores/dragAction";
  import { globalEvents } from "~/events";
</script>

<r-toolbar>
  <ToolButton
    shortcut={"1"}
    on:click={() => globalEvents.emit("advanced-edit")}
  >
    {#if $advancedEdit}
      <FaMountain />
    {:else}
      <FaMousePointer />
    {/if}
  </ToolButton>
  <ToolButton
    shortcut={"2"}
    on:click={() => globalEvents.emit("toggle-drag-action")}
  >
    {#if $dragAction === "pan"}
      <FaArrowsAlt />
    {:else}
      <FaCircleNotch />
    {/if}
  </ToolButton>
</r-toolbar>

<style>
  r-toolbar {
    display: flex;
    padding: 7px 6px;
    background: var(--background-transparent-gray);
    border-radius: 4px;
    height: min-content;

    /* Custom CSS for buttons within Toolbar */
    --margin: 2px;
    --padv: 6px;
    --padh: 6px;
    --top-radius: 2px;
    --right-radius: 2px;
    --bottom-radius: 2px;
    --left-radius: 2px;

    --bg-hover-color: var(--foreground-gray, gray);
    --bg-color: var(--foreground-white, white);
    --fg-color: var(--background-gray, black);
  }
</style>
