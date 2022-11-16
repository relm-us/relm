<script lang="ts">
  import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";
  import FaCircleNotch from "svelte-icons/fa/FaCircleNotch.svelte";

  import { globalEvents } from "~/events/globalEvents";
  import { dragAction } from "~/stores/dragAction";

  import ToolButton from "./ToolButton.svelte";

  function onClick() {
    globalEvents.emit("toggle-drag-action");
  }
</script>

<!-- Pan/Rotate Camera Toggle-->
{#if $dragAction === "rotate"}
  <ToolButton
    shortcut={"2"}
    bgState={1}
    tip={"Rotate Camera Enabled"}
    on:click={onClick}
  >
    <FaCircleNotch />
  </ToolButton>
{:else}
  <ToolButton
    shortcut={"2"}
    bgState={0}
    tip={"Pan Camera Enabled"}
    on:click={onClick}
  >
    <FaArrowsAlt />
  </ToolButton>
{/if}
