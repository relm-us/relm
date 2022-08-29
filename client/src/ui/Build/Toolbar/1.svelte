<script lang="ts">
  import FaMousePointer from "svelte-icons/fa/FaMousePointer.svelte";
  import FaMountain from "svelte-icons/fa/FaMountain.svelte";

  import { globalEvents } from "~/events";
  import { advancedEdit } from "~/stores/advancedEdit";

  import ToolButton from "./ToolButton.svelte";

  function onClick() {
    globalEvents.emit("advanced-edit");
  }
</script>

<!-- Object/Ground Select -->
{#if $advancedEdit}
  <ToolButton
    shortcut={"1"}
    bgState={1}
    tip={"Selecting Ground Enabled"}
    on:click={onClick}
  >
    <FaMountain />
  </ToolButton>
{:else}
  <ToolButton
    shortcut={"1"}
    bgState={0}
    tip={"Selecting Ground Disabled"}
    on:click={onClick}
  >
    <FaMousePointer />
  </ToolButton>
{/if}
