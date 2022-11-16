<script lang="ts">
  import FaObjectGroup from "svelte-icons/fa/FaObjectGroup.svelte";
  import FaObjectUngroup from "svelte-icons/fa/FaObjectUngroup.svelte";

  import { globalEvents } from "~/events/globalEvents";
  import { selectedGroups } from "~/stores/selection";

  import ToolButton from "./ToolButton.svelte";

  function onClick() {
    globalEvents.emit("toggle-selection-as-group");
  }
</script>

<!-- Group/Ungroup Toggle-->
{#if $selectedGroups.size === 0}
  <ToolButton
    shortcut={"3"}
    bgState={0}
    tip={"Selected Objects Ungrouped"}
    on:click={onClick}
  >
    <FaObjectUngroup />
  </ToolButton>
{:else}
  <ToolButton
    shortcut={"3"}
    bgState={1}
    tip={"Selected Objects Grouped"}
    on:click={onClick}
  >
    <FaObjectGroup />
  </ToolButton>
{/if}
